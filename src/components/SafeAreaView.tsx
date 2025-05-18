import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SafeAreaView = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();
  const top = typeof insets.top === 'number' ? insets.top : 0;
  const left = typeof insets.left === 'number' ? insets.left : 0;
  const right = typeof insets.right === 'number' ? insets.right : 0;

  return (
    <View
      style={{
        flex: 1,
        paddingTop: top,
        paddingLeft: left,
        paddingRight: right,
      }}
    >
      {children}
    </View>
  );
};
