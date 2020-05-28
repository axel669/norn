const eventBus = () => {
    const handlers = new Map()

    return {
        sub: (handler) => {
            const id = `${Date.now()}:${Math.random().toString(16)}`
            handlers.set(id, handler)
            return () => handlers.delete(id)
        },
        send: (...data) => {
            for (const handler of handlers.values()) {
                handler(...data)
            }
        }
    }
}

module.exports = eventBus
