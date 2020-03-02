import {useEffect, useState} from "react"
import update from "@axel669/immutable-update/esm"

const subscriptionBus = () => {
    const handlers = new Map()

    return {
        sub: (handler) => {
            const id = `${Date.now()}:${Math.random().toString(16)}`
            handlers.set(id, handler)
            return () => handlers.delete(id)
        },
        send: (data) => {
            for (const handler of handlers.values()) {
                handler(data)
            }
        }
    }
}

const fullName = (parent, child) =>
    (parent === null) ? child : `${parent}.${child}`
const processSource = (name, sourceName, source, shared) => {
    if (typeof source !== "function") {
        throw new Error(`Handler is not a function in ${sourceName}:${name}`)
    }
    shared.actions[name] = [
        ...(shared.actions[name] || []),
        [sourceName, source]
    ]
}
const processRootSource = (name, sourceName, source, shared) => {
    if (typeof source === "function") {
        shared.preprocess[name] = (firstArg) => firstArg
        processSource(name, sourceName, source, shared)
        return
    }

    shared.preprocess[name] = (typeof source.args === "function")
        ? source.args
        : (...args) => args.reduce(
            (arg, value, index) => {
                arg[source.args[index]] = value
                return arg
            },
            {}
        )
    processSource(name, sourceName, source.handler, shared)
}
const processEntry = (name, entry, shared) => {
    const { initial, ...actionSource } = entry

    shared.initial[name] = initial
    for (const [type, source] of Object.entries(actionSource)) {
        const [actionName, processor] = (type.startsWith("$") === true)
            ? [fullName(name, type), processRootSource]
            : [type, processSource]
        processor(actionName, name, source, shared)
    }
}
const processDescriptor = (parent, desc, shared) => {
    for (const [name, subDesc] of Object.entries(desc)) {
        const subName = fullName(parent, name)
        const next = (subDesc.initial === undefined)
            ? processDescriptor
            : processEntry
        next(subName, subDesc, shared)
    }
}
const createStore = (descriptor) => {
    const shared = {
        initial: {},
        actions: {},
        preprocess: {},
    }
    processDescriptor(null, descriptor, shared)

    const subscriptions = subscriptionBus()
    const internalState = shared.initial
    let expandedState = update.expand(internalState)
    const dispatch = async (...actions) => {
        for (const [action, ...args] of actions) {
            const arg = shared.preprocess[action.type](...args)
            for (const [source, func] of shared.actions[action.type]) {
                internalState[source] = await func(
                    internalState[source],
                    arg,
                    action.type
                )
            }
        }
        expandedState = update.expand(internalState)
        subscriptions.send(expandedState)
    }
    const storeActions = Object.keys(shared.actions)
        .reduce(
            (actions, name) => {
                actions[name] = (...args) => {
                    dispatch([{ type: name }, ...args])
                }
                actions[name].type = name
                return actions
            },
            {}
        )

    return {
        store: {
            getState: () => expandedState,
            currentState: () => expandedState,
            subscribe: subscriptions.sub,
        },
        actions: update.expand(
            {
                $batch: (...actions) => {
                    dispatch(...actions)
                },
            },
            storeActions
        ),
    }
}

const useStore = (store) => {
    const [current, update] = useState(store.getState())

    useEffect(
        () => store.subscribe(
            nextState => update(nextState)
        ),
        []
    )

    return current
}
createStore.useStore = useStore

export default createStore
