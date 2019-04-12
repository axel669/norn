'use strict';

var react = require('react');

const connect = (app, reducer = (state) => state) => (Component) => {
    var _class0, nullref0;

    return (
        (_class0 = class extends react.PureComponent {
            constructor(props) {
                super(props);
                this.state = reducer(app.state, this.props);
                this.unsub = app.subscribe((newState) =>
                    this.setState(() => reducer(newState))
                );
            }
            componentWillUnmount() {
                return this.unsub();
            }
            render() {
                return React.createElement(Component, {
                    ...{
                        ...this.props,
                        ...this.state
                    }
                });
            }
        }),
        (_class0.displayName = `Connected(${
            (nullref0 = Component.name) != null
                ? nullref0
                : Component.displayName
        })`),
        _class0
    );
};

module.exports = connect;
