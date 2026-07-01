import { Component } from 'react'
import Button from '../ui/Button.jsx'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--c-bg-secondary)] p-8">
          <div className="text-center max-w-md card">
            <div className="card-content">
              <div className="text-5xl mb-3">😵</div>
              <h1 className="text-xl font-bold text-[var(--c-text)] mb-2">出错了</h1>
              <p className="text-[var(--c-text-secondary)] text-sm mb-5">
                页面遇到了一个意外错误，请刷新页面重试。
              </p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                刷新页面
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
