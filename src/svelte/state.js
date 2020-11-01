import {readable} from "svelte/store"

import createStore from "../norn.js"

const createSvelteStore = description => {
    const {readState, subscribe, ...actions} = createStore(description)
    return {
        update: actions,
        subscribe: callback => {
            callback(readState())
            return subscribe(callback)
        }
    }
}

export default createSvelteStore
