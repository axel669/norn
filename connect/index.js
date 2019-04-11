'use strict';

var react = require('react');

const connect = (app, reducer = (state) => state) => (Component) => {

    return class extends react.PureComponent {
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
    };
};

module.exports = connect;
