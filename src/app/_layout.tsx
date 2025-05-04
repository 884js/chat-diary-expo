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
import { SafeAreaView } from "@/components/Themed";
import { useColorScheme } from '@/hooks/useColorScheme';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export {
  ErrorBoundary,
} from 'expo-router';

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

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ReactQueryProvider>
        <SafeAreaView className="flex-1">
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            <Stack.Screen
              name="(chat)/message-context-menu"
              options={{
                contentStyle: {
                  flex: 1,
                },
                headerShown: false,
                presentation: "formSheet",
                gestureDirection: "vertical",
                animation: "slide_from_bottom",
                sheetGrabberVisible: false,
                sheetInitialDetentIndex: 0,
                sheetAllowedDetents: [0.3, 1.0],
                headerTitle: "Title",
                headerRight: (navigation) => (
                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ padding: 8 }}
                  >
                    <Ionicons name="close" size={24} />
                  </TouchableOpacity>
                ),
                gestureEnabled: false,
              }}
            />
          </Stack>
        </SafeAreaView>
      </ReactQueryProvider>
    </ThemeProvider>
  );
}
