import { useState, useEffect } from 'react';

const useDidMount = effect => useEffect(effect, []);

const connect = (store, reducer = state => state) => Component => {
  function Wrapper(props) {
    const [state, updateState] = useState(reducer(store.state, props));
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

export default connect;
