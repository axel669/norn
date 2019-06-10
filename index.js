'use strict';

const actions = {
    $set: (source, value) => value,
    $unset: (source, names) => {
        const copy = {...source};
        for (const name of names) {
            delete copy[name];
        }
        return copy
    },
    $push: (source, value) => [...source, value],
    $append: (source, value) => [...source, ...value],
    $apply: (source, func) => func(source),
    $filter: (source, condition) => source.filter(condition),
    $merge: (source, addition) => ({...source, ...addition})
};

const internal_copyObject = (obj, createIfVoid = false) => {
    if (Array.isArray(obj) === true) {
        return [...obj]
    }
    if (obj === undefined && createIfVoid === true) {
        return {}
    }
    if (typeof obj !== "object" || obj === null) {
        return obj
    }
    if (obj instanceof Map) {
        return new Map(obj)
    }
    if (obj instanceof Set) {
        return new Set(obj)
    }
    if (obj.constructor !== Object) {
        return obj
    }
    return {...obj}
};

const internal_setValues = (dest, key, n, value, create) => {
    const name = key[n];
    if (n === (key.length - 1)) {
        return actions[name](dest, value)
    }
    else {
        dest = internal_copyObject(dest, create);
        dest[name] = internal_setValues(
            dest[name],
            key,
            n + 1,
            value,
            create
        );
    }
    return dest
};

const splitKey = key => key
    .split(/(?<!\.)\.(?!\.)/)
    .map(part => part.replace(/\.\./g, "."));
const update = (source, obj, createIfUndefined = false) => Object.keys(obj)
    .reduce(
        (source, key) => internal_setValues(
            source,
            splitKey(key),
            0,
            obj[key],
            createIfUndefined
        ),
        source
    );

update.actions = actions;
update.expand = (...sources) => sources.reduce(
    (dest, next) => {
        const updates = Object.entries(next)
            .reduce(
                (u, [key, value]) => {
                    u[`${key}.$set`] = value;
                    return u
                },
                {}
            );
        return update(dest, updates, true)
    },
    {}
);
update.seq = (source, ...updates) => updates.reduce(
    (source, [update, value, createIfVoid = false]) => internal_setValues(
        source,
        splitKey(update),
        0,
        value,
        createIfVoid
    ),
    source
);

const createReducer = desc => {
  const reducers = [];

  for (const [key, map] of Object.entries(desc)) {
    const reducer = typeof map === "function" ? map : createReducer(map);
    reducers.push([key, reducer]);
  }

  return async (state, action) => {
    const newState = {};

    for (const [key, reducer] of reducers) {
      newState[key] = await reducer(state[key], action);
    }

    return newState;
  };
};

const generateStateInfo = (source, desc) => {
  const reducers = [];
  const initialState = {};
  const definedActions = new Set();
  const sieves = {};

  for (const [key, info] of Object.entries(desc)) {
    const path = source !== null ? `${source}.${key}` : key;
    const {
      initial
    } = info;

    if (initial === undefined) {
      const child = generateStateInfo(path, info)[(childActions)] = child;
      definedActions.add(...childActions);
    } else {
      const actionHandlers = {};
      sieves[key] = [];

      for (const [action, func] of Object.entries(info)) {
        if (action.indexOf("*") !== -1) {
          const regexText = action.replace(/\./g, "\\.").replace(/\$/g, "\\$").replace(/\*/g, ".*?");
          sieves[key].push([new RegExp(`^${regexText}$`), func]);
        } else {
          actionHandlers[action] = func;

          if (action.startsWith("$") === true) {
            definedActions.add(`${path}.${action}`);
          }

          if (action.indexOf("$") > 0) {
            definedActions.add(action);
          }
        }
      }

      initialState[key] = typeof initial === "function" ? initial() : initial;

      reducers[key] = (state, action) => {
        const actions = action.type === "batch" ? action.actions : [action];
        return actions.reduce((newState, action) => {
          const type = action.type.startsWith(`${path}.`) === true ? action.type.slice(path.length + 1) : action.type;
          const reducer = actionHandlers[type];

          if (reducer !== undefined) {
            return reducer(newState, action);
          } else {
            for (const [sieve, reducer] of sieves[key]) {
              if (sieve.test(type) === true) {
                return reducer(newState, action);
              }
            }
          }

          return newState;
        }, state);
      };
    }
  }

  return [reducers, initialState, definedActions];
};

const createStore = (desc, actionProcessors = {}) => {
  const [reducers, initialState, definedActions] = generateStateInfo(null, desc);
  const reducer = createReducer(reducers);
  const subscriptions = new Map();
  const preprocessors = Object.entries(actionProcessors).reduce((pp, [type, info]) => {
    if (Array.isArray(info) === true) {
      pp[type] = (...args) => args.reduce((item, arg, index) => ({ ...item,
        [info[index]]: arg
      }), {
        type
      });
    } else {
      pp[type] = info;
    }

    return pp;
  }, {});
  let currentState = initialState;

  const dispatch = async action => {
    currentState = await reducer(currentState, action);

    for (const handler of subscriptions.values()) {
      handler(currentState);
    }

    return currentState;
  };

  const actions = [...definedActions].reduce((actions, type) => {
    const pp = preprocessors[type] || (i => i);

    actions[type] = (...args) => dispatch({
      type,
      ...pp(...args)
    });

    return actions;
  }, {
    $batch: (...pairs) => dispatch({
      type: "batch",
      actions: pairs.map(([type, ...args]) => {
        const pp = preprocessors[type] || (i => i);

        return {
          type,
          ...pp(...args)
        };
      })
    })
  });

  const subscribe = listener => {
    const key = `${Date.now()}:${Math.random()}`;
    subscriptions.set(key, listener);
    return () => subscriptions.delete(key);
  };

  const validActions = [...definedActions].sort();
  return {
    actions: update.expand(actions),
    store: {
      get state() {
        return currentState;
      },

      get current() {
        return currentState;
      },

      get validActions() {
        return [...validActions];
      },

      subscribe
    }
  };
};

module.exports = createStore;
