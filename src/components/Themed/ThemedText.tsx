import { type ThemeProps, useThemeColor } from '@/hooks/useThemeColor';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
export type TextProps = ThemeProps & RNTextProps;

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color =
    useThemeColor({ light: lightColor, dark: darkColor }, 'text') || '#000';

  return (
    <RNText
      style={[{ fontFamily: 'MPlus1-Regular', color }, style]}
      {...otherProps}
    />
  );
}
