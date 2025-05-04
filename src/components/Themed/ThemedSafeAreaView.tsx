import { useThemeColor } from '@/hooks/useThemeColor';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  SafeAreaView as RNFSafeAreaView,
  type SafeAreaViewProps,
} from 'react-native-safe-area-context';

type ThemedSafeAreaViewProps = SafeAreaViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function SafeAreaView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedSafeAreaViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background',
  );

  return (
    <RNFSafeAreaView
      style={[{ backgroundColor }, style] as StyleProp<ViewStyle>}
      {...otherProps}
    />
  );
}
