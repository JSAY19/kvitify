import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorPage } from '../../pages/ErrorPage'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorPage
          status={500}
          title="Ой, мы где-то споткнулись"
          message="Приложение упало неожиданно. Это не ты — это мы. Попробуй обновить страницу."
          hint={this.state.error.message}
          showReload
        />
      )
    }
    return this.props.children
  }
}
