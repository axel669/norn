import { useEffect } from 'react';

const useDidMount = (effect) => useEffect(effect, []);
const connect = (store, reducer = (state) => state) => (Component) => (
    props
) => {
    const [state, updateState] = React.useState(store.state);
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

export default connect;
