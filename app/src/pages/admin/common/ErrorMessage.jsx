import { AlertCircle, RefreshCw, X } from 'lucide-react'

const ErrorMessage = ({ 
  message, 
  onRetry, 
  onDismiss,
  title = "Error",
  variant = "error", // 'error', 'warning', 'info'
  className = "",
  showIcon = true,
  showAction = true
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          button: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
        }
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-400',
          title: 'text-blue-800',
          message: 'text-blue-700',
          button: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }
      case 'error':
      default:
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-400',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'bg-red-100 text-red-700 hover:bg-red-200'
        }
    }
  }

  const styles = getVariantStyles()

  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return <AlertCircle className="w-5 h-5" />
      case 'info':
        return <AlertCircle className="w-5 h-5" />
      case 'error':
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  return (
    <div 
      className={`rounded-lg border p-4 ${styles.container} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        {/* Icon */}
        {showIcon && (
          <div className={`flex-shrink-0 ${styles.icon} mr-3 mt-0.5`}>
            {getIcon()}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1">
          {title && (
            <h4 className={`text-sm font-medium mb-1 ${styles.title}`}>
              {title}
            </h4>
          )}
          
          <div className={`text-sm ${styles.message}`}>
            {typeof message === 'string' ? (
              <p>{message}</p>
            ) : (
              // Handle array of messages or React nodes
              message
            )}
          </div>

          {/* Actions */}
          {(onRetry || onDismiss) && showAction && (
            <div className="mt-3 flex space-x-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${styles.button}`}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Try Again
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <X className="w-3 h-3 mr-1" />
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>

        {/* Close Button (top right) */}
        {onDismiss && !showAction && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorMessage