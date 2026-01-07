import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert, ViewStyle } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

interface GoogleSignInProps {
  style?: ViewStyle;
  children?: React.ReactNode;
}

export default function GoogleSignIn({ style, children }: GoogleSignInProps) {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Lấy Client IDs từ file .env
  const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID; // Optional

  useEffect(() => {
    console.log('🔍 ========== GOOGLE SIGNIN CONFIG ==========');
    console.log('🔍 Web Client ID:', WEB_CLIENT_ID);
    console.log('🔍 iOS Client ID:', IOS_CLIENT_ID);
    console.log('🔍 ===========================================');

    if (!WEB_CLIENT_ID || WEB_CLIENT_ID.includes('YOUR_')) {
      Alert.alert(
        'Config Error',
        'Web Client ID chưa được cấu hình! Vui lòng thêm Web Client ID từ Google Console.'
      );
      return;
    }

    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      iosClientId: IOS_CLIENT_ID,
    });
  }, []);

  const signIn = async () => {
    setIsLoading(true);
    try {
      console.log('🔵 ========== GOOGLE SIGN-IN START ==========');
      
      await GoogleSignin.hasPlayServices();
      console.log('✅ Google Play Services available');
      
      // Sign out previous session
      try {
        await GoogleSignin.signOut();
        console.log('✅ Previous session cleared');
      } catch (e) {
        console.log('ℹ️ No previous session');
      }
      
      console.log('🔵 Prompting Google Sign-In...');
      const userInfo = await GoogleSignin.signIn();
      
      console.log('✅ Google Sign-In successful!');
      console.log('📦 Full userInfo:', JSON.stringify(userInfo, null, 2));
      
      // ✅ LOG CHI TIẾT
      console.log('👤 User:', userInfo.data?.user);
      console.log('🔑 ID Token exists?', !!userInfo.data?.idToken);
      console.log('🔑 ID Token length:', userInfo.data?.idToken?.length);
      console.log('🔐 Server Auth Code:', userInfo.data?.serverAuthCode);
      
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        console.error('❌ No ID Token in response!');
        console.error('❌ Available fields:', Object.keys(userInfo.data || {}));
        
        Alert.alert(
          'Lỗi cấu hình',
          'Không nhận được ID Token từ Google.\n\nKiểm tra:\n• Web Client ID có đúng?\n• SHA-1 fingerprint đã thêm vào Google Console?\n• OAuth Client là loại Android?'
        );
        throw new Error('No ID Token found');
      }

      console.log('✅ ID Token received, length:', idToken.length);
      console.log('🔵 Calling backend...');
      
      await handleBackendLogin(idToken);
      
      console.log('🔵 ========== GOOGLE SIGN-IN END ==========');
      
    } catch (error: any) {
      console.error('❌ ========== GOOGLE SIGN-IN ERROR ==========');
      console.error('❌ Error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('ℹ️ User cancelled sign-in');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Đang xử lý', 'Đang thực hiện đăng nhập...');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Lỗi', 'Google Play Services không khả dụng.');
      } else {
        Alert.alert('Lỗi đăng nhập', error.message);
      }
      
      console.error('❌ ===========================================');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackendLogin = async (idToken: string) => {
    try {
      const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;
      const endpoint = `${apiBaseUrl}/api/v1/auth/google`;
      
      console.log('🔵 ========== BACKEND LOGIN ==========');
      console.log('🔵 Endpoint:', endpoint);
      console.log('🔵 ID Token (first 50):', idToken.substring(0, 50) + '...');
      
      const res = await axios.post(endpoint, {
        idToken: idToken,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'UniVolunteerApp/1.0',
        },
        timeout: 15000,
      });

      console.log('✅ Backend Response:', res.data);
      console.log('🔵 ====================================');

      const { accessToken, refreshToken, userId, profileComplete } = res.data.data;

      if (!accessToken || !userId) {
        throw new Error('Invalid response from backend');
      }

      const user = {
        id: userId,
        email: '', 
        profileComplete: profileComplete,
      };

      await login(accessToken, user);
      Alert.alert('Thành công', 'Đăng nhập thành công!');
      router.replace('/(tabs)/home');

    } catch (error: any) {
      console.error('❌ ========== BACKEND ERROR ==========');
      console.error('❌ Error:', error);
      
      if (error.response) {
        console.error('❌ Status:', error.response.status);
        console.error('❌ Data:', error.response.data);
        Alert.alert('Lỗi Server', JSON.stringify(error.response.data));
      } else if (error.request) {
        console.error('❌ No response from server');
        Alert.alert('Lỗi kết nối', 'Không kết nối được server');
      } else {
        Alert.alert('Lỗi', error.message);
      }
      
      console.error('❌ ====================================');
    }
  };

  const buttonStyles = children 
    ? [style, isLoading && styles.buttonDisabled]
    : [styles.defaultButton, style, isLoading && styles.buttonDisabled];

  return (
    <TouchableOpacity 
      style={buttonStyles as ViewStyle}
      onPress={signIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={children ? "#EA4335" : "#fff"} />
      ) : (
        children || (
          <>
            <Ionicons name="logo-google" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.text}>Đăng nhập với Google</Text>
          </>
        )
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
  buttonDisabled: {
    opacity: 0.7,
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