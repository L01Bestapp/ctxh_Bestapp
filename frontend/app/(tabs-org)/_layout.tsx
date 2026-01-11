import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, Image } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
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
                    tabBarIcon: ({ color }) => <Ionicons size={24} name="home" color={color} />,
                }}
            />
            <Tabs.Screen
                name="activity"
                options={{
                    title: 'Activity',
                    tabBarIcon: ({ color }) => <Ionicons size={24} name="document-text" color={color} />,
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
                            <Ionicons size={32} name="qr-code" color="#000" />
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
                name="events"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
        </Tabs>
    );
}
