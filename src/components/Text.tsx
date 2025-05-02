import { Text as DefaultText, type TextProps } from './Themed';

export function Text(props: TextProps) {
  return (
    <DefaultText
      {...props}
      style={[props.style, { fontFamily: 'MPlus1-Regular' }]}
    />
  );
}
