import React from 'react';
import { AlertTriangle, Wifi, WifiOff, Server, Key, RefreshCw } from 'lucide-react';

export interface ErrorDisplayProps {
  error: string | Error;
  type?: 'network' | 'server' | 'auth' | 'general';
  retry?: () => void;
  className?: string;
  showRetry?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  type = 'general', 
  retry, 
  className = '',
  showRetry = true 
}) => {
  const getErrorConfig = () => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    switch (type) {
      case 'network':
        return {
          icon: WifiOff,
          title: 'Connection Error',
          message: errorMessage || 'Unable to connect to the server. Please check your internet connection.',
          color: 'orange',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
          iconColor: 'text-orange-600'
        };
      case 'server':
        return {
          icon: Server,
          title: 'Server Error',
          message: errorMessage || 'The server is having trouble processing your request. Please try again later.',
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      case 'auth':
        return {
          icon: Key,
          title: 'Authentication Error',
          message: errorMessage || 'Please check your API configuration. The AI service requires valid credentials.',
          color: 'purple',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-800',
          iconColor: 'text-purple-600'
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Error',
          message: errorMessage || 'An unexpected error occurred. Please try again.',
          color: 'gray',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`${config.bgColor} p-2 rounded-full border ${config.borderColor}`}>
          <Icon size={20} className={config.iconColor} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${config.textColor} mb-1`}>
            {config.title}
          </h3>
          <p className={`text-sm ${config.textColor} opacity-80`}>
            {config.message}
          </p>
          
          {showRetry && retry && (
            <button
              onClick={retry}
              className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium ${config.textColor} hover:opacity-80 transition-opacity`}
            >
              <RefreshCw size={14} />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
