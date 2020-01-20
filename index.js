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
    .replace(/\.\./g, "\x01")
    .split(/\./)
    .map(part => part.replace(/\x01/g, "."));
    // .split(/(?<!\.)\.(?!\.)/)
    // .map(part => part.replace(/\.\./g, "."))
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

const subscriptionBus = () => {
  const handlers = new WeakMap();
  return {
    sub: handler => {
      const id = `${Date.now()}:${Math.random().toString(16)}`;
      handlers.set(id, handler);
      return () => handlers.delete(id);
    },
    send: data => {
      for (const handler of handlers.values()) {
        handler(data);
      }
    }
  };
};

const fullName = (parent, child) => parent === null ? child : `${parent}.${child}`;

const processSource = (name, sourceName, source, shared) => {
  shared.actions[name] = [...(shared.actions[name] || []), [sourceName, source]];
};

const processRootSource = (name, sourceName, source, shared) => {
  if (typeof source === "function") {
    shared.preprocess[name] = firstArg => firstArg;

    processSource(name, sourceName, source, shared);
    return;
  }

  shared.preprocess[name] = typeof source.args === "function" ? source.args : (...args) => args.reduce((arg, value, index) => {
    arg[source.args[index]] = value;
    return arg;
  }, {});
  processSource(name, sourceName, source.handler, shared);
};

const processEntry = (name, entry, shared) => {
  const {
    initial,
    ...actionSource
  } = entry;
  shared.initial[name] = initial;

  for (const [type, source] of Object.entries(actionSource)) {
    const [actionName, processor] = type.startsWith("$") === true ? [fullName(name, type), processRootSource] : [type, processSource];
    processor(actionName, name, source, shared);
  }
};

const processDescriptor = (parent, desc, shared) => {
  for (const [name, subDesc] of Object.entries(desc)) {
    const subName = fullName(parent, name);
    const next = subDesc.initial === undefined ? processDescriptor : processEntry;
    next(subName, subDesc, shared);
  }
};

const createStore = descriptor => {
  const shared = {
    initial: {},
    actions: {},
    preprocess: {}
  };
  processDescriptor(null, descriptor, shared);
  const subscriptions = subscriptionBus();
  const internalState = shared.initial;
  let expandedState = update.expand(internalState);

  const dispatch = async (...actions) => {
    for (const [action, ...args] of actions) {
      const arg = shared.preprocess[action.type](...args);

      for (const [source, func] of shared.actions[action.type]) {
        internalState[source] = await func(internalState[source], arg, action.type);
      }
    }

    expandedState = update.expand(internalState);
    subscriptions.send(expandedState);
  };

  const storeActions = Object.keys(shared.actions).reduce((actions, name) => {
    actions[name] = arg => {
      dispatch([{
        type: name
      }, arg]);
    };

    actions[name].type = name;
    return actions;
  }, {});
  return {
    store: {
      getState: () => expandedState,
      currentState: () => expandedState,
      subscribe: subscriptions.sub
    },
    actions: update.expand({
      $batch: (...actions) => {
        dispatch(...actions);
      }
    }, storeActions)
  };
};

module.exports = createStore;
