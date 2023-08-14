import React, { useState } from 'react'

import './ErrorScreen.scss'

import ErrorScreenImage from '../../images/error-screen-image.png'

import Button from '../Button/Button'
import Icon from '../Icon/Icon'

function ErrorScreen({ stackTrace }) {
  const [expanded, setExpanded] = useState(false)
  const expandClass = expanded ? 'active' : ''

  return (
    <div className="error-screen-wrapper">
      <div className="error-screen-content-frame">
        <div className="error-screen-column-left">
          <div className="error-screen-title">Sorry...</div>
          <div className="error-screen-subtitle">Acorn has crashed</div>
          <div className="error-screen-description">
            Please help us improve the app's performance by{' '}
            <a href="https://github.com/h-be/acorn/issues/new" target="_blank">
              reporting the issue
            </a>
            . Try pressing 'Reload' and if that doesn't work, try fully
            restarting the application.
          </div>
          <div className="error-screen-buttons">
            <a
              className="error-screen-report-issue-button"
              href="https://github.com/h-be/acorn/issues/new"
              target="_blank"
            >
              <Button text="Report Issue" size="medium" className="green" />
            </a>
            <Button
              text="Reload"
              size="medium"
              className="purple"
              onClick={() => window.location.reload()}
            />
          </div>
          <div className="show-stack-trace-wrapper">
            <div
              className="show-stack-trace-button"
              onClick={() => setExpanded(!expanded)}
            >
              <div className="show-stack-trace-button-text">
                {expanded ? 'Hide stack trace' : 'Show stack trace'}
              </div>
              <Icon
                name={expanded ? 'chevron-down.svg' : 'chevron-right.svg'}
                size="small"
                className="grey"
              />
            </div>
            {expanded && (
              <textarea className="show-stack-trace-field">
                {stackTrace}
              </textarea>
            )}
          </div>
        </div>
        <div className="error-screen-column-right">
          <img src={ErrorScreenImage} />
        </div>
      </div>
    </div>
  )
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorText: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      errorText: error.message + '\n\n' + error.stack,
    }
  }
  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <ErrorScreen stackTrace={this.state.errorText} />
    }
    return this.props.children
  }
}

export default ErrorBoundary
