import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ViewStyle } from 'react-native';
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'; // Commented out to prevent crash
import { Ionicons } from '@expo/vector-icons';

interface GoogleSignInProps {
  style?: ViewStyle;
  children?: React.ReactNode;
}

export default function GoogleSignIn({ style, children }: GoogleSignInProps) {
  const signIn = async () => {
    Alert.alert(
      "Expo Go Warning",
      "Google Sign-In không khả dụng trên Expo Go do yêu cầu Native Module.\nVui lòng sử dụng tài khoản/mật khẩu bình thường hoặc dùng Development Build."
    );
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