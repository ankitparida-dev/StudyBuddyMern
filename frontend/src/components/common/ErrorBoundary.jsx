import React from 'react';
import '../../styles/ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔥 Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to error tracking service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In production, send to your error tracking service
    if (process.env.NODE_ENV === 'production') {
      try {
        // Example: Send to backend
        // fetch('/api/log-error', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     error: error.toString(),
        //     stack: error.stack,
        //     componentStack: errorInfo?.componentStack,
        //     timestamp: new Date().toISOString(),
        //     url: window.location.href,
        //     userAgent: navigator.userAgent
        //   })
        // }).catch(console.error);
      } catch (e) {
        console.error('Failed to log error:', e);
      }
    }
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { fallback, children } = this.props;

    if (!hasError) {
      return children;
    }

    // Use custom fallback if provided
    if (fallback) {
      return fallback;
    }

    // Default error UI
    return (
      <div className="error-boundary" role="alert">
        <div className="container">
          <div className="error-content">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle" />
            </div>
            <h2>Something Went Wrong</h2>
            <p className="error-message">
              {error?.message || 'An unexpected error occurred'}
            </p>
            <p className="error-help">
              Please try refreshing the page or contact support if the problem persists.
            </p>
            <div className="error-actions">
              <button 
                className="btn btn-primary" 
                onClick={this.handleRefresh}
              >
                <i className="fas fa-sync-alt" /> Refresh Page
              </button>
              <button 
                className="btn btn-outline" 
                onClick={this.handleGoHome}
              >
                <i className="fas fa-home" /> Go to Home
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={this.handleGoBack}
              >
                <i className="fas fa-arrow-left" /> Go Back
              </button>
            </div>
            
            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && errorInfo && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <div className="error-stack">
                  <h4>Error:</h4>
                  <pre>{error?.toString()}</pre>
                  <h4>Component Stack:</h4>
                  <pre>{errorInfo.componentStack}</pre>
                </div>
              </details>
            )}
            
            {/* Support contact */}
            <div className="error-support">
              <p>
                Need help? Contact us at{' '}
                <a href="mailto:support@studybuddy.com">support@studybuddy.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;