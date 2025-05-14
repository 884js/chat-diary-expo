import { type ThemeProps, useThemeColor } from '@/hooks/useThemeColor';
import type { TextProps as RNTextProps } from 'react-native';
import { Linking } from 'react-native';
import ParsedText from 'react-native-parsed-text';

export type TextProps = ThemeProps & RNTextProps;

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, children, ...otherProps } = props;
  const color =
    useThemeColor({ light: lightColor, dark: darkColor }, 'text') || '#000';

  const handleUrlPress = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.warn('リンクを開けませんでした: ', err),
    );
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <ParsedText
      style={[{ fontFamily: 'MPlus1-Regular', color }, style]}
      parse={[
        {
          type: 'url',
          style: { textDecorationLine: 'underline' },
          className: '!text-link',
          onPress: handleUrlPress,
        },
        {
          type: 'email',
          style: { color: 'purple', textDecorationLine: 'underline' },
          onPress: handleEmailPress,
        },
      ]}
      childrenProps={otherProps}
    >
      {children}
    </ParsedText>
  );
}
