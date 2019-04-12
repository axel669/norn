var NornConnectHook = (function (react) {
    'use strict';

    const useDidMount = (effect) => react.useEffect(effect, []);
    const connect = (store, reducer = (state) => state) => (Component) => {
        const wrapper = (props) => {
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
        Object.defineProperty(wrapper, "name", {
            enumerable: false,
            configurable: false,
            get: () => {
                var nullref0;

                return `Connected(${
                (nullref0 = Component.name) != null
                    ? nullref0
                    : Component.displayName
            })`;
            }
        });
        return wrapper;
    };

    return connect;

}(React));
