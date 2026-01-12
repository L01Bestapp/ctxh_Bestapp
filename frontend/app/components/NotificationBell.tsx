import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { fetchUnreadCount } from '@/services/notificationService';

export default function NotificationBell() {
    const router = useRouter();
    const { token } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const loadUnreadCount = useCallback(async () => {
        if (token) {
            const count = await fetchUnreadCount(token);
            setUnreadCount(count);
        }
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            loadUnreadCount();
        }, [loadUnreadCount])
    );

    return (
        <TouchableOpacity style={styles.menuIcon} onPress={() => router.push('/notifications')}>
            <View>
                <Ionicons name="notifications-outline" size={28} color="#333" />
                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    menuIcon: {
        padding: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 50,
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#FF4058',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
