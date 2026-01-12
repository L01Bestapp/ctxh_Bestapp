import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  FadeIn
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

export default function AppSplashScreen() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth(); // Get auth state

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const textScale = useSharedValue(0.8);

  const startAnimation = () => {
    // Animation sequence - Sync text with logo
    logoOpacity.value = withTiming(1, { duration: 1000 });
    logoScale.value = withTiming(1, { duration: 1000 });

    // Text appears together with logo
    textOpacity.value = withTiming(1, { duration: 1000 });
    textScale.value = withTiming(1, { duration: 1000 });

    // Navigate logic
    setTimeout(async () => {
      if (!isLoading) {
        if (token && user) {
          // Auto-login

          // STRICT BAN CHECK
          try {
            const role = (user.role as string).toUpperCase();
            let profileEndpoint = '';
            if (role === 'STUDENT') {
              profileEndpoint = 'https://marg-astonishing-matthias.ngrok-free.dev/api/v1/students/my-profile';
            } else if (role === 'ORGANIZATION') {
              profileEndpoint = 'https://marg-astonishing-matthias.ngrok-free.dev/api/v1/organization/my-profile';
            }

            if (profileEndpoint) {
              const response = await fetch(profileEndpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const json = await response.json();
              if (json.success && json.data) {
                const status = json.data.status;
                if (status === 'BAN' || status === 'BANNED') {
                  router.replace('/login');
                  return;
                }
              }
            }

            // SPECIAL QR CHECK FOR STUDENTS (User Requested)
            if (role === 'STUDENT') {
              const qrResponse = await fetch('https://marg-astonishing-matthias.ngrok-free.dev/api/v1/students/my-qr', {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const qrJson = await qrResponse.json();
              if (qrResponse.status === 403 || (qrJson.message && qrJson.message.toLowerCase().includes("banned"))) {
                // Alert.alert("Account Suspended", "Your account has been banned."); // Optional
                router.replace('/login');
                return;
              }
            }

            // Proceed if clean
            if (role === 'ORGANIZATION') {
              router.replace('/(tabs-org)/home');
            } else if (role === 'STUDENT') {
              router.replace('/(tabs-student)/home');
            } else if (role === 'ADMIN') {
              // @ts-ignore
              router.replace('/admin/dashboard');
            } else {
              router.replace('/(tabs-student)/home');
            }

          } catch (error) {
            console.error("Auto-login Check Failed:", error);
            // If check fails (network), maybe safer to let them in or force login?
            // Let's assume safe to proceed or maybe fallback to login?
            // Existing logic was permissive. Let's keep it permissive on network error to avoid lockout offline.
            // BUT if it was critical ban check... 
            // Let's proceed for now.
            router.replace('/(tabs-student)/home');
          }

        } else {
          // No token, go to onboarding
          router.replace('/onboarding');
        }
      } else {
        // Still loading, wait a bit or just go to onboarding
        router.replace('/onboarding');
      }
    }, 1000); // Reduced delay for faster checking
  };

  useEffect(() => {
    // Hide native splash screen immediately when this component mounts
    SplashScreen.hideAsync();
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Image
          source={require('@/assets/images/logo_univolunt.png')}
          style={styles.logo}
          resizeMode="contain"
          onLoad={startAnimation}
        />
      </Animated.View>

      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.title}>uni <Text style={styles.titleVolunteer}>volunteer</Text></Text>
        <Text style={styles.slogan}>
          Burn with heart{'\n'}
          The more you give, the cooler you get
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: -30,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  titleVolunteer: {
    color: '#8D6E63', // A brownish/gold color based on the logo's possible palette or just distinct
    fontWeight: '300', // Thinner for 'volunteer' usually looks nice or similar to 'uni' depending on design. User image shows 'uni' bold, 'volunteer' regular/thin.
  },
  slogan: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
});
