import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FontAwesome6 } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function StudentTabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF4058', // Primary Red color
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            height: 85,
            paddingBottom: 25,
            backgroundColor: '#ffffff', // White background
            borderTopWidth: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 5,
          },
          default: {
            height: 70,
            paddingBottom: 10,
            backgroundColor: '#ffffff', // White background
            borderTopWidth: 0,
            elevation: 8,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="doc.text.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => (
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 32,
              height: 64,
              width: 64,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 30,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 5,
              borderWidth: 1,
              borderColor: '#eee'
            }}>
              <IconSymbol size={32} name="qrcode.viewfinder" color="#000" />
            </View>
          ),
          tabBarLabel: () => null, // Hide label for center button
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Statistics',
          tabBarIcon: ({ color }) => <FontAwesome6 size={24} name="chart-column" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome6 size={24} name="circle-user" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide explore if we are replacing it, or keep it if needed. User said 'y chang organization' so likely hide or remove. I'll hide it.
        }}
      />
    </Tabs>
  );
}
