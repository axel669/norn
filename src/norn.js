const createReducer = (desc) => {
    const reducers = []

    for (const [key, map] of Object.entries(desc)) {
        const reducer = (typeof map === "function")
            ? map
            : createReducer(map)
        reducers.push([key, reducer])
    }

    return async (state, action) => {
        const newState = {}
        for (const [key, reducer] of reducers) {
            newState[key] = await reducer(state[key], action)
        }
        return newState
    }
}

const generateStateInfo = (source, desc) => {
    const reducers = []
    const initialState = {}
    const definedActions = new Set()
    const sieves = {}

    for (const [key, info] of Object.entries(desc)) {
        const path = (source !== null) ? `${source}.${key}` : key
        const {initial} = info

        if (initial === undefined) {
            const child = generateStateInfo(path, info)
            [reducers[key], initialState[key], childActions] = child
            definedActions.add(...childActions)
        }
        else {
            const actionHandlers = {}
            sieves[key] = []
            for (const [action, func] of Object.entries(info)) {
                if (action.indexOf("*") !== -1) {
                    const regexText = action
                        .replace(/\./g, "\\.")
                        .replace(/\$/g, "\\$")
                        .replace(/\*/g, ".*?")
                    sieves[key].push([
                        new RegExp(`^${regexText}$`),
                        func
                    ])
                }
                else {
                    actionHandlers[action] = func
                    if (action.startsWith("$") === true) {
                        definedActions.add(`${path}.${action}`)
                    }
                    if (action.indexOf("$") > 0) {
                        definedActions.add(action)
                    }
                }
            }
            initialState[key] = (typeof initial === "function")
                ? initial()
                : initial
            reducers[key] = (state, action) => {
                const actions = (action.type === "batch")
                    ? action.actions
                    : [action]

                return actions.reduce(
                    (newState, action) => {
                        const type =
                            (action.type.startsWith(`${path}.`) === true)
                                ? action.type.slice(path.length + 1)
                                : action.type
                        const reducer = actionHandlers[type]

                        if (reducer !== undefined) {
                            return reducer(newState, action)
                        }
                        else {
                            for (const [sieve, reducer] of sieves) {
                                if (sieve.test(type) === true) {
                                    return reducer(newState, action)
                                }
                            }
                        }
                    },
                    state
                )
            }
        }
    }

    return [reducers, initialState, definedActions]
}

const createStore = (desc, actionProcessors = {}) => {
    const [
        reducers,
        initialState,
        definedActions
    ] = generateStateInfo(null, desc)
    const reducer = createReducer(reducers)
    const subscriptions = new Map()
    const preprocessors = Object
        .entries(actionProcessors)
        .reduce(
            (pp, [type, info]) => {
                if (Array.isArray(info) === true) {
                    pp[type] = (...args) => args.reduce(
                        (item, arg, index) => ({
                            ...item,
                            [info[index]]: arg
                        }),
                        {type}
                    )
                }
                else {
                    pp[type] = info
                }
            },
            {}
        )

    let currentState = initialState
    const dispatch = async (action) => {
        currentState = await reducer(currentState, action)

        for (const handler of subscriptions.values()) {
            handler(currentState)
        }

        return currentState
    }
    const actions = [...definedActions].reduce(
        (actions, type) => {
            const pp = preprocessors[type] || (i => i)
            actions[type] = (...args) => dispatch({type, ...pp(...args)})
        },
        {
            $batch: (...pairs) => dispatch({
                type: "batch",
                actions: pairs.map(
                    ([type, ...args]) => {
                        const pp = preprocessors[type] || (i => i)
                        return {type, ...pp(...args)}
                    }
                )
            })
        }
    )

    const subscribe = listener => {
        const key = `${Date.now()}:${Math.random()}`
        subscriptions.set(key, listener)

        return () => subscriptions.delete(key)
    }
    const validActions = [...definedActions].sort()

    return {
        actions,
        store: {
            get state() {
                return currentState
            },
            get current() {
                return currentState
            },
            get validActions() {
                return [...validActions]
            },
            subscribe
        }
    }
}
