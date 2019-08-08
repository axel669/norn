'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

const connect = (app, reducer = state => state) => Component => {
  var _class, _temp, _Component$name;

  return _temp = _class = class extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = reducer(app.state, props);
      this.unsub = app.subscribe(newState => this.setState(() => reducer(newState, props)));
    }

    componentWillUnmount() {
      this.unsub();
    }

    render() {
      return React__default.createElement(Component, { ...this.props,
        ...this.state
      });
    }

  }, _defineProperty(_class, "displayName", `Connected(${(_Component$name = Component.name) !== null && _Component$name !== void 0 ? _Component$name : Component.displayName})`), _temp;
};

module.exports = connect;
