const assert = require("assert").strict

const norn = require("../index.js")

const store = norn({
    test: {
        initial: 0,
        $inc: (test) => test + 1,
        $dec: (test) => test - 1,
        $add: (test, value) => test + value
    },
    nest: {
        even: {
            initial: true,
            "test.$inc": (test) => test === false,
            "test.$dec": (test) => test === false,
        },
        odd: {
            initial: false,
            toggle: odd => odd === false
        }
    }
})

const main = async () => {
    store.subscribe(
        (next, _, changes) => {
            console.log(next)
            console.log(changes)
        }
    )

    assert.strictEqual(store.readState().test, 0)

    store.test.$inc()
    assert.strictEqual(store.readState().test, 1)

    store.test.$add(10)
    assert.strictEqual(store.readState().test, 11)

    store.nest.odd.toggle()
    assert.strictEqual(store.readState().nest.odd, true)
}

main()
