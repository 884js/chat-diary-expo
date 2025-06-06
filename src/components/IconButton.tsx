import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  type TouchableOpacityProps,
  View as RNView,
} from 'react-native';
import { Text } from './Themed';

interface IconButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'subtle';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  icon: ReactNode;
  children?: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function IconButton({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  icon,
  children,
  className = '',
  fullWidth = false,
  ...props
}: IconButtonProps) {
  const baseClasses = 'flex-row items-center justify-center rounded-lg transition-all duration-150 active:scale-[0.98]';
  
  const variantClasses = {
    primary: 'bg-blue-600 active:bg-blue-700 shadow-sm',
    secondary: 'bg-white border border-gray-300 active:bg-gray-50 shadow-sm',
    danger: 'bg-red-600 active:bg-red-700 shadow-sm',
    ghost: 'bg-transparent active:bg-gray-100',
    subtle: 'bg-gray-100 active:bg-gray-200',
  };
  
  const disabledClasses = {
    primary: 'bg-gray-300 shadow-none',
    secondary: 'bg-gray-50 border-gray-200 shadow-none',
    danger: 'bg-gray-300 shadow-none',
    ghost: 'opacity-40',
    subtle: 'bg-gray-50 opacity-60',
  };
  
  const sizeClasses = {
    small: 'px-3.5 py-1.5 min-h-[34px]',
    medium: 'px-5 py-2.5 min-h-[42px]',
    large: 'px-6 py-3 min-h-[50px]',
  };
  
  const textVariantClasses = {
    primary: 'text-white font-semibold',
    secondary: 'text-gray-900 font-semibold',
    danger: 'text-white font-semibold',
    ghost: 'text-gray-900 font-semibold',
    subtle: 'text-gray-900 font-semibold',
  };
  
  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };
  
  const iconSpacing = children ? (size === 'small' ? 'mr-1.5' : size === 'medium' ? 'mr-2' : 'mr-2.5') : '';
  
  const isDisabled = disabled || isLoading;
  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${
    isDisabled ? disabledClasses[variant] : variantClasses[variant]
  } ${fullWidth ? 'w-full' : ''} ${className}`;
  
  const textClasses = `${textVariantClasses[variant]} ${textSizeClasses[size]} ${
    isDisabled && (variant === 'primary' || variant === 'danger') ? 'text-gray-500' : ''
  }`;
  
  return (
    <TouchableOpacity
      {...props}
      disabled={isDisabled}
      className={buttonClasses}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={
            variant === 'secondary' || variant === 'ghost' || variant === 'subtle' 
              ? '#6B7280' 
              : isDisabled 
              ? '#6B7280'
              : 'white'
          } 
          size="small"
        />
      ) : (
        <RNView className="flex-row items-center">
          <RNView className={iconSpacing}>{icon}</RNView>
          {children && <Text className={textClasses}>{children}</Text>}
        </RNView>
      )}
    </TouchableOpacity>
  );
}