import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';

interface CircleIconButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  icon: ReactNode;
  className?: string;
}

export function CircleIconButton({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  icon,
  className = '',
  ...props
}: CircleIconButtonProps) {
  const baseClasses = 'items-center justify-center rounded-full transition-all duration-200';
  
  const variantClasses = {
    primary: 'bg-blue-600 active:bg-blue-700 shadow-md',
    secondary: 'bg-white border border-gray-300 active:bg-gray-50 shadow-md',
    danger: 'bg-red-600 active:bg-red-700 shadow-md',
    ghost: 'bg-gray-100 active:bg-gray-200',
  };
  
  const disabledClasses = {
    primary: 'bg-blue-400 opacity-60',
    secondary: 'bg-gray-50 border-gray-200 opacity-60',
    danger: 'bg-red-400 opacity-60',
    ghost: 'bg-gray-50 opacity-60',
  };
  
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
  };
  
  const isDisabled = disabled || isLoading;
  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${
    isDisabled ? disabledClasses[variant] : variantClasses[variant]
  } ${className}`;
  
  return (
    <TouchableOpacity
      {...props}
      disabled={isDisabled}
      className={buttonClasses}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={variant === 'secondary' || variant === 'ghost' ? '#6B7280' : 'white'} 
          size="small"
        />
      ) : (
        icon
      )}
    </TouchableOpacity>
  );
}