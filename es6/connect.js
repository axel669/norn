import { PureComponent } from 'react';

const connect = (app, reducer = (state, props) => state) => (Component) => {

    return class extends PureComponent {
        constructor(props) {
            super(props);
            this.state = reducer(app.state, this.props);
            this.unsub = app.subscribe((newState) =>
                this.setState(() => reducer(newState, this.props))
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

export default connect;