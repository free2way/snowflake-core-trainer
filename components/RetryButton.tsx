import React, { useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

export interface RetryButtonProps {
  onRetry: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
  maxRetries?: number;
  retryCount?: number;
  error?: string;
}

const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  maxRetries,
  retryCount = 0,
  error
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (loading || isRetrying || disabled) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const isMaxRetriesReached = maxRetries !== undefined && retryCount >= maxRetries;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white border-red-600';
      case 'secondary':
        return 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300';
      default:
        return 'bg-snow-600 hover:bg-snow-700 text-white border-snow-600';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2';
    }
  };

  const isDisabled = loading || isRetrying || disabled || isMaxRetriesReached;

  return (
    <div className="space-y-2">
      <button
        onClick={handleRetry}
        disabled={isDisabled}
        className={`
          inline-flex items-center gap-2 rounded-lg border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-snow-500 disabled:opacity-50 disabled:cursor-not-allowed
          ${getVariantStyles()}
          ${getSizeStyles()}
          ${className}
        `}
      >
        {(loading || isRetrying) ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            <span>{isRetrying ? 'Retrying...' : 'Loading...'}</span>
          </>
        ) : (
          <>
            <RefreshCw size={16} />
            <span>{children || 'Try Again'}</span>
          </>
        )}
      </button>

      {/* Retry information */}
      {(maxRetries !== undefined || error) && (
        <div className="text-sm">
          {isMaxRetriesReached ? (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle size={14} />
              <span>Maximum retries reached. Please contact support.</span>
            </div>
          ) : maxRetries !== undefined ? (
            <div className="text-slate-500">
              {retryCount > 0 && (
                <span>Tried {retryCount} {retryCount === 1 ? 'time' : 'times'}</span>
              )}
              {retryCount < maxRetries && (
                <span> • {maxRetries - retryCount} attempts remaining</span>
              )}
            </div>
          ) : null}

          {error && (
            <div className="text-red-600 mt-1">
              Last error: {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RetryButton;
