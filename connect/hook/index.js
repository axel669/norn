'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);

const useDidMount = effect => React.useEffect(effect, []);

const connect = (store, reducer = state => state) => Component => {
  function Wrapper(props) {
    const [state, updateState] = React.useState(reducer(store.state, props));
    useDidMount(() => store.subscribe(latest => updateState(reducer(latest, props))));
    return React__default.createElement(Component, { ...state,
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

module.exports = connect;
