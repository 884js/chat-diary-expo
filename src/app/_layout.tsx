import '@/global.css';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { View } from '@/components/Themed';
import { AuthProvider } from '@/features/auth/contexts/AuthContext';
import { MessageActionProvider } from '@/features/chat/contexts/MessageActionContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import {
  ReanimatedLogLevel,
  configureReanimatedLogger,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export { ErrorBoundary } from 'expo-router';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'MPlus1-Medium': require('../assets/fonts/mplus/Mplus1-Medium.ttf'),
    'MPlus1-Regular': require('../assets/fonts/mplus/Mplus1-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ReactQueryProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ReactQueryProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const top = typeof insets.top === 'number' ? insets.top : 0;
  const bottom = typeof insets.bottom === 'number' ? insets.bottom : 0;
  const left = typeof insets.left === 'number' ? insets.left : 0;
  const right = typeof insets.right === 'number' ? insets.right : 0;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <MessageActionProvider>
        <View
          style={{
            paddingTop: top,
            paddingBottom: bottom,
            paddingLeft: left,
            paddingRight: right,
            flex: 1,
          }}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(chat)/message-context-menu"
              options={{
                contentStyle: {
                  flex: 1,
                },
                headerShown: false,
                presentation: 'formSheet',
                gestureDirection: 'vertical',
                sheetInitialDetentIndex: 0,
                sheetAllowedDetents: [0.3],
                animationDuration: 40,
                headerRight: (navigation) => (
                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ padding: 8 }}
                  >
                    <Ionicons name="close" size={24} />
                  </TouchableOpacity>
                ),
              }}
            />
            <Stack.Screen
              name="auth/login"
              options={{
                headerShown: false,
                presentation: 'transparentModal',
                gestureEnabled: true,
              }}
            />
          </Stack>
        </View>
      </MessageActionProvider>
    </ThemeProvider>
  );
}
