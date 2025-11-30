import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      default:
        return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'secondary':
        return 'text-slate-600';
      case 'white':
        return 'text-white';
      default:
        return 'text-snow-600';
    }
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 
        className={`animate-spin ${getSizeClasses()} ${getColorClasses()}`}
      />
      {text && (
        <span className={`text-sm font-medium ${getColorClasses()}`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
