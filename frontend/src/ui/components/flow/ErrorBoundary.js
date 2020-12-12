import React from 'react'

import ErrorNote from './ErrorNote'

export default class ErrorBoundary extends React.PureComponent {
  state = {
    hasError: false,
    counter: 0,
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
	}
	
  componentDidCatch(error, info) {
    // ToDo later: log error and info.
  }

  render() {
		if (this.state.hasError)
			return <ErrorNote text={this.props.text} />
		return this.props.children
  }
}