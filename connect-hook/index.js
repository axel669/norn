'use strict';

var react = require('react');

const useDidMount = (effect) => react.useEffect(effect, []);
const connect = (store, reducer = (state) => state) => (Component) => (
    props
) => {
    const [state, updateState] = React.useState(reducer(store.state));
    useDidMount(() =>
        store.subscribe((latest) => updateState(reducer(latest)))
    );
    return React.createElement(Component, {
        ...{
            ...state,
            ...props
        }
    });
};

module.exports = connect;
