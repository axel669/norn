import {useEffect, useState} from "react"

const useStore = (store, changes = null) => {
    const [state, update] = useState(store.readState())

    useEffect(
        () => store.subscribe(
            (next, _, changedProps) => {
                if (changes !== null) {
                    if (changes.length === 0) {
                        return
                    }

                    const changeIndexes = changes.map(
                        prop => changedProps.indexOf(prop)
                    )
                    if (changeIndexes.some(i => i !== -1) === false) {
                        return
                    }
                }

                update(next)
            }
        ),
        []
    )

    return state
}

export default useStore
