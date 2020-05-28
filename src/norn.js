import update from "@axel669/immutable-update"

import eventBus from "./event-bus.js"

const fullName = (parent, name = null) => {
    if (name === null) {
        return parent.join(".")
    }

    if (name.includes(".") === true) {
        return name
    }

    return [...parent, name].join(".")
}

const initialValue = (info, parent, key) => {
    if (info.initial !== undefined) {
        const name = fullName(parent, key)
        const value = (typeof info.initial === "function")
            ? info.initial()
            : info.initial

        return {
            [name]: value
        }
    }
    return buildInitial(info, [...parent, key])
}
const buildInitial = (descriptor, parent = []) => {
    const state = {}
    for (const [key, info] of Object.entries(descriptor)) {
        Object.assign(state, initialValue(info, parent, key))
    }
    return state
}

const buildActions = (descriptor, parent = []) => {
    const entries = Object.entries(descriptor)

    if (descriptor.initial === undefined) {
        return entries.reduce(
            (actions, [key, subDescriptor]) => [
                ...actions,
                ...buildActions(subDescriptor, [...parent, key])
            ],
            []
        )
    }

    const actions = []
    for (const [key, handler] of entries) {
        if (key !== "initial") {
            const path = fullName(parent, key)
            actions.push([
                path,
                fullName(parent),
                handler,
            ])
        }
    }
    return actions
}

const createStore = (descriptor) => {
    const updates = eventBus()

    const internalState = buildInitial(descriptor)
    const stateProps = Object.keys(internalState)
    let readableState = update.expand(internalState)

    const actionList = buildActions(descriptor)

    const actionHandlers = actionList.reduce(
        (handlers, [actionPath, target, handler]) => ({
            ...handlers,
            [actionPath]: [
                ...(handlers[actionPath] || []),
                [target, handler]
            ]
        }),
        {}
    )

    const $batch = async (...commands) => {
        const prevInternal = {...internalState}
        for (const [type, params] of commands) {
            for (const [target, handler] of actionHandlers[type]) {
                internalState[target] = await handler(
                    internalState[target],
                    params,
                    type
                )
            }
        }
        const previousState = readableState
        readableState = update.expand(internalState)
        const changes = stateProps.filter(
            prop => internalState[prop] !== prevInternal[prop]
        )
        updates.send(readableState, previousState, changes)
    }
    const actions = update.expand(
        {$batch},
        Object.keys(actionHandlers)
            .reduce(
                (actions, type) => ({
                    ...actions,
                    [type]: params => $batch([type, params])
                }),
                {}
            )
    )

    return {
        actions,
        store: {
            readState() {
                return readableState
            },
            subscribe: updates.sub
        }
    }
}

export default createStore
