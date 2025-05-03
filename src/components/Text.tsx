import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

export type TextProps = RNTextProps;

export function Text(props: RNTextProps) {
  const { style, children, ...rest } = props;
  return (
    <RNText style={[{ fontFamily: 'MPlus1-Regular' }, style]} {...rest}>
      {children}
    </RNText>
  );
}
