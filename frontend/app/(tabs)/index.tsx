import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import React, { useEffect, useState } from 'react';
import { getHelloMessage } from '../../services/apiService';

export default function HomeScreen() {
  // State để lưu tin nhắn từ server
  const [message, setMessage] = useState('Đang tải từ server...');

  // Logic gọi API khi màn hình được mở
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await getHelloMessage();
        setMessage(response.data); // Lấy data từ response
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        setMessage('Kết nối thất bại đến BE! Hãy kiểm tra IP/Port trong file apiConfig.js và đảm bảo BE đang chạy.');
      }
    };

    fetchMessage();
  }, []); // [] nghĩa là chỉ chạy 1 lần khi màn hình mở

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Kết quả từ Server:</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText style={styles.messageText}>
          {message}
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  messageText: {
    fontSize: 18,
    color: '#007AFF', 
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  }
});
