const norn = require("../index.js")

let t = 0
const {store, actions} = norn(
    {
        list: {
            initial: () => [],
            $add: (list, {name, id}) => [...list, {name, id}]
        },
        groups: {
            initial: {},
            $add: (groups, {id, item}) => ({
                ...groups,
                [id]: item
            }),
            "list.$add": (_0, action) => {
                console.log("action", action)
                return _0
            }
        }
    },
    {
        "list.$add": (name) => {
            let id = t
            t += 1
            return {name, id}
        },
        "groups.$add": ["id", "item"]
    }
)

store.subscribe(
    (next) => console.log(next)
)

const main = async () => {
    console.log(store.state)
    await actions.list.$add("test")
    await actions.$batch(
        ["list.$add", "test2"],
        ["groups.$add", 0, 100]
    )
}

main()
