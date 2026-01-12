import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Safely attempt to import GoogleSignin to avoid crashes in Expo Go
let GoogleSignin: any;
let statusCodes: any;
let isErrorWithCode: any;

try {
  const googleSigninModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSigninModule.GoogleSignin;
  statusCodes = googleSigninModule.statusCodes;
  isErrorWithCode = googleSigninModule.isErrorWithCode;
} catch (error) {
  console.warn("Google Sign-In native module not found. This is expected in Expo Go.");
}

interface GoogleSignInProps {
  style?: ViewStyle;
  children?: React.ReactNode;
  onPress?: () => void;
  onSignInSuccess?: (idToken: string) => void;
}

export default function GoogleSignIn({ style, children, onPress, onSignInSuccess }: GoogleSignInProps) {
  const isNativeModuleAvailable = !!GoogleSignin;

  useEffect(() => {
    if (isNativeModuleAvailable) {
      try {
        GoogleSignin.configure({
          webClientId: '903756698510-mm4je49oscmnkjm246t207bg0skuveom.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
        });
      } catch (err) {
        console.error("GoogleSignin configure error:", err);
      }
    }
  }, []);

  const signIn = async () => {
    if (onPress) {
      onPress();
      return;
    }

    if (!isNativeModuleAvailable) {
      Alert.alert(
        "Not Supported in Expo Go",
        "Google Sign-In requires a Development Build or Native App. It does not work in Expo Go."
      );
      return;
    }

    try {
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignore error if user wasn't signed in
      }

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.data?.idToken) {
        if (onSignInSuccess) {
          onSignInSuccess(userInfo.data.idToken);
        } else {
          console.log("Login Success (No Callback). ID Token:", userInfo.data.idToken);
        }
      } else {
        Alert.alert("Google Sign-In Error", "Could not retrieve ID Token.");
      }
    } catch (error: any) {
      if (isErrorWithCode && isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log("User cancelled login payment");
            break;
          case statusCodes.IN_PROGRESS:
            Alert.alert("Login in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert("Play Services Error", "Google Play Services not available.");
            break;
          default:
            Alert.alert("Login Error", error.message);
        }
      } else {
        Alert.alert("Error", "An unexpected error occurred: " + error.message);
      }
    }
  };

  const buttonStyles = children
    ? [style]
    : [styles.defaultButton, style];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={signIn}
    >
      {children || (
        <>
          <Ionicons name="logo-google" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.text}>Đăng nhập với Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  defaultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DB4437',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});