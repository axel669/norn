var norn = (function (react) {
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

    var immutableUpdate = update;

    const eventBus = () => {
      const handlers = new Map();
      return {
        sub: handler => {
          const id = `${Date.now()}:${Math.random().toString(16)}`;
          handlers.set(id, handler);
          return () => handlers.delete(id);
        },
        send: (...data) => {
          for (const handler of handlers.values()) {
            handler(...data);
          }
        }
      };
    };

    var eventBus_1 = eventBus;

    const fullName = (parent, name = null) => {
      if (name === null) {
        return parent.join(".");
      }

      if (name.includes(".") === true) {
        return name;
      }

      return [...parent, name].join(".");
    };

    const initialValue = (info, parent, key) => {
      if (info.initial !== undefined) {
        const name = fullName(parent, key);
        const value = typeof info.initial === "function" ? info.initial() : info.initial;
        return {
          [name]: value
        };
      }

      return buildInitial(info, [...parent, key]);
    };

    const buildInitial = (descriptor, parent = []) => {
      const state = {};

      for (const [key, info] of Object.entries(descriptor)) {
        Object.assign(state, initialValue(info, parent, key));
      }

      return state;
    };

    const buildActions = (descriptor, parent = []) => {
      const entries = Object.entries(descriptor);

      if (descriptor.initial === undefined) {
        return entries.reduce((actions, [key, subDescriptor]) => [...actions, ...buildActions(subDescriptor, [...parent, key])], []);
      }

      const actions = [];

      for (const [key, handler] of entries) {
        if (key !== "initial") {
          const path = fullName(parent, key);
          actions.push([path, fullName(parent), handler]);
        }
      }

      return actions;
    };

    const createStore = descriptor => {
      const updates = eventBus_1();
      const internalState = buildInitial(descriptor);
      const stateProps = Object.keys(internalState);
      let readableState = immutableUpdate.expand(internalState);
      const actionList = buildActions(descriptor);
      const actionHandlers = actionList.reduce((handlers, [actionPath, target, handler]) => ({ ...handlers,
        [actionPath]: [...(handlers[actionPath] || []), [target, handler]]
      }), {});

      const $batch = (...commands) => {
        const prevInternal = { ...internalState
        };

        for (const [type, params] of commands) {
          for (const [target, handler] of actionHandlers[type]) {
            internalState[target] = handler(internalState[target], params, type);
          }
        }

        const previousState = readableState;
        readableState = immutableUpdate.expand(internalState);
        const changes = stateProps.filter(prop => internalState[prop] !== prevInternal[prop]);
        updates.send(readableState, previousState, changes);
      };

      const actions = immutableUpdate.expand({
        $batch
      }, Object.keys(actionHandlers).reduce((actions, type) => ({ ...actions,
        [type]: params => $batch([type, params])
      }), {}));
      return { ...actions,

        readState() {
          return readableState;
        },

        subscribe: updates.sub
      };
    };

    const useStore = (store, changes = null) => {
      const [state, update] = react.useState(store.readState());
      react.useEffect(() => store.subscribe((next, _, changedProps) => {
        if (changes !== null) {
          if (changes.length === 0) {
            return;
          }

          const changeIndexes = changes.map(prop => changedProps.indexOf(prop));

          if (changeIndexes.some(i => i !== -1) === false) {
            return;
          }
        }

        update(next);
      }), []);
      return state;
    };

    createStore.useStore = useStore;

    return createStore;

}(React));
