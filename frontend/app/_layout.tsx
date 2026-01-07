import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/AuthContext';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="index">
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs-student)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs-org)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
          <Stack.Screen name="signup/role-selection" options={{ headerShown: false }} />
          <Stack.Screen name="signup/student" options={{ headerShown: false }} />
          <Stack.Screen name="signup/organization" options={{ headerShown: false }} />
          <Stack.Screen name="login/index" options={{ headerShown: false }} />
          <Stack.Screen name="login/forgot-password" options={{ headerShown: false }} />
          <Stack.Screen name="login/otp-verification" options={{ headerShown: false }} />
          <Stack.Screen name="login/reset-password" options={{ headerShown: false }} />
          <Stack.Screen name="get-started/index" options={{ headerShown: false }} />
        <Stack.Screen name="create-activity" options={{ headerShown: false }} />
        <Stack.Screen name="update-activity" options={{ headerShown: false }} />
        <Stack.Screen name="handle-request" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
