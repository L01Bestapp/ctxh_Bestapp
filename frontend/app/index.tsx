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

const { width } = Dimensions.get('window');

export default function AppSplashScreen() {
  const router = useRouter();
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

    // Navigate to tabs after 3 seconds from start of animation
    setTimeout(() => {
      // @ts-ignore
      router.replace('/onboarding');
    }, 3000);
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
