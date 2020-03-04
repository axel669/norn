# Norn

A light-weight library for managing application state.

## Inspiration
Redux has a lot of boilerplate, I don't like making actions separate from reducers.

## API

```js
const {action, store} = norn({
    "property": {
        initial: "value",
        $action: (currentValue, action) => newValue,
        $action2: {
            args: ["frist", "second"],
            handler: (currentValue, {first, second}) => newValue
        }
    },
    "another": {
        "nested": {
            initial: "wat",
            $reset: () => "wat",
            "property.$action2": (_, {first}) => first
        }
    }
})

store.subscribe(
    newState => doSomething(newState)
)

await actions.property.$action({prop: 0})

await actions.$batch(
    ["property.$action2", "first", "second"],
    ["another.nested.$reset"]
)

//  With React
function Component(props) {
    const {property} = norn.useStore(store)
}
```

Norn takes an object describing the state of the application with the actions applicable to each property. In a similar fashion to redux, parts of the store can react to actions in another part of the store using sieves, should an action need to be reflected in more than one place at a time.

Actions can be defined with an optional conversion from an argument list to an object, because sometimes I'm lazy.
