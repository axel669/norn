this.NornConnect = this.NornConnect || {};
this.NornConnect.Hook = (function (react) {
    'use strict';

    const useDidMount = effect => react.useEffect(effect, []);

    const connect = (store, reducer = state => state) => Component => {
      function Wrapper(props) {
        const [state, updateState] = react.useState(reducer(store.state, props));
        useDidMount(() => store.subscribe(latest => updateState(reducer(latest, props))));
        return React.createElement(Component, { ...state,
          ...props
        });
      }

      Object.defineProperty(Wrapper, "name", {
        enumerable: false,
        configurable: false,

        get() {
          var _Component$name;

          return `Connected(${(_Component$name = Component.name) !== null && _Component$name !== void 0 ? _Component$name : Component.displayName})`;
        }

      });
      return Wrapper;
    };

    return connect;

}(React));
