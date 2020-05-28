# Norn

A light-weight library for managing application state.

## Inspiration
Redux has a lot of boilerplate, I don't like making actions separate from reducers.

## API

```js
import norn from "@axel669/norn"
const {action, store} = norn({
    "property": {
        initial: "value",
        $action: (currentValue, action) => newValue,
        $action2: (currentValue, {first, second}) => newValue
    },
    "another": {
        "nested": {
            initial: "wat",
            reset: () => "wat",
            "property.$action2": (_, {first}) => first
        }
    }
})

store.subscribe(
    newState => doSomething(newState)
)

await actions.property.$action({prop: 0})

await actions.$batch(
    ["property.$action2", {first: "first", second: "second"}],
    ["another.nested.$reset"]
)

//  With React
import useStore from "@axel669/norn/hooks"
function Component(props) {
    const {property} = useStore(store)
}

function SmallComponent(props) {
    const {thing} = useStore(store, ["thing"])
}

function SmallComponent(props) {
    const {thing} = useStore(store, ["nested.thing"]).nested
}
```

Norn takes an object describing the state of the application with the actions
applicable to each property. In a similar fashion to redux, parts of the store
can react to actions in another part of the store using sieves, should an action
need to be reflected in more than one place at a time.

The hook provided (`useStore`) takes a store as the first argument and an
optional set of props to listen for updates to. In a similar fashion to React
hooks like `useEffect`, the hook will only pass updated state if the properties
specified change.
