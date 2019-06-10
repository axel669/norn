import {useEffect, useState} from "react"

const useDidMount = (effect) => useEffect(effect, [])
const connect = (store, reducer = (state) => state) =>
    (Component) => {
        function Wrapper(props) {
            const [state, updateState] = useState(
                reducer(store.state, props)
            )
            useDidMount(
                () => store.subscribe(
                    (latest) => updateState(
                        reducer(latest, props)
                    )
                )
            )

            return <Component {...{...state, ...props}} />
        }
        Object.defineProperty(
            Wrapper,
            "name",
            {
                enumerable: false,
                configurable: false,
                get() {
                    return `Connected(${Component.name ?? Component.displayName})`
                }
            }
        )

        return Wrapper
    }

export default connect
