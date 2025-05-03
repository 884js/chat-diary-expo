import { Text as DefaultText, type TextProps as DefaultTextProps } from '@/components/Text';
import { type ThemeProps, useThemeColor } from "@/hooks/useThemeColor";

export type TextProps = ThemeProps & DefaultTextProps;

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

