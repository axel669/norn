# Norn

A light-weight library for managing application state.

## Inspiration
Redux has a lot of boilerplate, I don't like making actions separate from
reducers.

## API

### Standalone
```js
import norn from "@axel669/norn"
const store = norn({
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

state.property.$action({prop: 0})

//  depreacted, leaving in until I am more certain it's not needed
state.$batch(
    ["property.$action2", {first: "first", second: "second"}],
    ["another.nested.reset"]
)
```

### With React
```js
import norn from "@axel669/norn/react"
function Component(props) {
    const {property} = norn.useStore(store)
}

function SmallComponent(props) {
    const {thing} = norn.useStore(store, ["thing"])
}

function SmallComponent(props) {
    const {thing} = norn.useStore(store, ["nested.thing"]).nested
}
```

### With Svelte
```html
<script>
    import norn from "@axel669/norn/svelte";

    const store = norn({
        name: {
            initial: "World",
            set: (_, name) => name
        }
    });
</script>

<div>Hello, {$store.name}</div>
<button on:click={() => store.name.set("")}>Clear</button>
```

Norn takes an object describing the state of the application with the actions
applicable to each property. In a similar fashion to redux, parts of the store
can react to actions in another part of the store using sieves, should an action
need to be reflected in more than one place at a time.

The hook provided (`norn.useStore`) takes a store as the first argument and an
optional set of props to listen for updates to. In a similar fashion to React
hooks like `useEffect`, the hook will only pass updated state if the properties
specified change.
