import React, {PureComponent} from "react"

const connect = (app, reducer = (state) => state) =>
    (Component) => class extends PureComponent {
        static displayName = `Connected(${Component.name ?? Component.displayName})`
        constructor(props) {
            super(props)
            this.state = reducer(app.state, props)
            this.unsub = app.subscribe(
                (newState) => this.setState(
                    () => reducer(newState, props)
                )
            )
        }

        componentWillUnmount() {
            this.unsub()
        }

        render() {
            return <Component {...{...this.props, ...this.state}} />
        }
    }

export default connect
