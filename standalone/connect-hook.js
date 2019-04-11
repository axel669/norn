var NornConnectHook = (function (react) {
    'use strict';

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

    return connect;

}(React));
