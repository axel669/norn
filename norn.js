'use strict';

const createReducer = (desc) => {
    var ref0;

    const reducers = [];
    for (const key of Object.keys((ref0 = desc))) {
        const map = ref0[key];
        const reducer = (() => {
            if (typeof map === "function") {
                return map;
            } else {
                return createReducer(map);
            }
        })();
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
    var ref0, ref1;

    const reducers = {};
    const initialState = {};
    let definedActions = new Set();
    for (const key of Object.keys((ref0 = desc))) {
        const info = ref0[key];
        const path = source !== null ? `${source}.${key}` : key;
        const initial = info.initial;
        if (initial === undefined) {
            const child = generateStateInfo(path, info);
            [reducers[key], initialState[key]] = child;
            definedActions = new Set([...definedActions, ...child[2]]);
        } else {
            const actionHandlers = {};
            for (const action of Object.keys((ref1 = info))) {
                const func = ref1[action];
                actionHandlers[action] = func;
                if (action.startsWith("$") === true) {
                    definedActions.add(`${path}.${action}`);
                }
                if (action.indexOf("$") > 0) {
                    definedActions.add(action);
                }
            }
            initialState[key] = initial();
            reducers[key] = async (state, action) => {
                let actions = [action];
                if (action.type === "batch") {
                    actions = action.actions;
                }
                let newState = state;
                for (const action of actions) {
                    let type = action.type;
                    if (type.startsWith(`${path}.`) === true) {
                        type = type.slice(path.length + 1, undefined);
                    }
                    const reducer = actionHandlers[type];
                    if (reducer !== undefined) {
                        newState = await reducer(newState, action);
                    }
                }
                return newState;
            };
        }
    }
    return [reducers, initialState, definedActions];
};
const createState = (desc) => {
    const [reducers, initialState, definedActions] = generateStateInfo(
        null,
        desc
    );
    const reducer = createReducer(reducers);
    const dispatch = async (store, action) => {
        currentState = await reducer(currentState, action);
        for (const listener of subscriptions.values()) {
            listener(currentState);
        }
        return currentState;
    };
    const actions = [...definedActions].reduce(
        (actions, type) => ({
            ...actions,
            [type]: (data) =>
                dispatch(store, {
                    type: type,
                    ...data
                })
        }),
        {
            $batch: (...pairs) =>
                dispatch(store, {
                    type: "batch",
                    actions: pairs.map(([type, data]) => ({
                        type: type,
                        ...data
                    }))
                })
        }
    );
    let currentState = initialState;
    const subscriptions = new Map();
    const subscribe = (listener) => {
        const key = `${Math.random()}:${Date.now()}`;
        subscriptions.set(key, listener);
        return () => subscriptions.delete(key);
    };
    const validActions = [...definedActions].sort();
    return {
        get state() {
            return currentState;
        },
        actions: actions,
        subscribe: subscribe,
        get validActions() {
            return [...validActions];
        }
    };
};

module.exports = createState;
