
<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->
<!-- code_chunk_output -->

- [Norn](#norn)
  - [Motivation](#motivation)
  - [API](#api)
    - [`norn(stateDescriptor, actionPreprocessors) -> {store: Store, actions: Object}`](#nornstatedescriptor-actionpreprocessors-store-store-actions-object)
      - [`stateDescriptor`](#statedescriptor)
        - [async](#async)
      - [`actionPreprocessors`](#actionpreprocessors)
      - [Usage](#usage)
    - [`Store.subscribe(handler)`](#storesubscribehandler)
      - [Usage](#usage-1)
    - [`Store.state`, `Store.current`](#storestate-storecurrent)
    - [`Store.validActions`](#storevalidactions)

<!-- /code_chunk_output -->
# Norn

## Motivation
I don't like how redux makes me separate my actions from my reducers.
That's really it.
I figured I could make something more like what I wanted to use, so I did.

## API

### `norn(stateDescriptor, actionPreprocessors) -> {store: Store, actions: Object}`
This function creates an store and an actions object based on the state
described. The store functions like a redux store, and the actions are a
collection of all valid actions available to the store.

```graphql
stateDescriptor {
    initial: Function | Value
    ...actions: Action
}
Action {
    $<action>: Function
    "sieve.$<action>": Function
}
```

#### `stateDescriptor`
A state descriptor has an initial value and actions that describe how to
update that chunk of state. descriptors can be nested, norn looks for the
most shallow object that has an `initial` property.

The `initial` property describes the starting value of the state. If `initial`
is a function, it is called when the store is created.

The actions take 2 forms:
- Local Action: `$<action>`
- Sieve Action: `other.state.$<action>`

Local Actions describe an action to directly interact with the state described
and Sieve Actions are for responding to actions in other parts of the state that
might be related but managed in a separate part of the store.

Each Local Action full name is just the path to access the function as normal
object values.
Sieves should use the full name of an action to indicate its from another part
of the state

##### async
Actions can be async functions, norn will await them before updating the state.

#### `actionPreprocessors`
The action preprocessors are used to format the action objects without long,
boilerplatey code. The preprocessor will take the arguments as given to the
action calls and should return an object containing the properties the action
is expected to have. If an array of names is used, norn will create a function that
takes the arguments and maps them to an object using the names given in the
array, with `arg[n]` using `name[n]` in the object. The keys for each
preprocessor are the full name of each action.

Action preprocessors are optional if you want to pass in the action object
directly to each call. If no preprocessor is found, the first argument to an
action call is merged into the action data.

#### Usage
```javascript
const {store, actions} = norn(
    {
        items: {
            initial: {},
            // actions on the local state
            // creates items.$add
            $add: (currentItems, action) => {
                const {newItem} = action

                return {
                    ...currentItems,
                    [newItem.id]: newItem,
                }
            },
        },
        //  nested state management
        bags: {
            info: {
                // load data that is saved
                initial: () => loadLocal("bagsInfo"),
                // creates bags.info.$add
                $add: (currentBags, action) => {
                    const {newBag} = action

                    return {
                        ...currentBags,
                        [newBag.id]: newBag,
                    }
                }
            },
            itemList: {
                initial: {},
                //  sieve for another bit of state that it should respond to
                "bags.info.$add": (currentLists, action) => {
                    const {newBag} = action
                    return {
                        ...currentLists,
                        [newBag.id]: [],
                    }
                },
            },
        },
    },
    {
        "items.$add": ["newItem"],
        // equivalent to: "bags.info.$add": (newBag) => ({newBag})
        "bags.ingo.$add": ["newBag"],
    }
)
```

### `Store.subscribe(handler)`

Allows a handler to be called every time the state is updated.

#### Usage
```javascript
// log every time the state changes
store.subscribe(
    latestState => console.log(latestState)
)
```

### `Store.state`, `Store.current`
Returns the current state of the store.

### `Store.validActions`
Returns a list of all valid actions that can be taken on the store.
