import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storage
export const NOTIFICATION_SETTINGS = {
    GENERAL: '@notif_general',
    SOUND: '@notif_sound',
    VIBRATE: '@notif_vibrate',
    APP_UPDATES: '@notif_updates',
    TIPS: '@notif_tips'
};

const FCM_TOKEN_KEY = '@fcm_token';
const FCM_TOKEN_SENT_KEY = '@fcm_token_sent';
const API_URL = 'https://marg-astonishing-matthias.ngrok-free.dev/api/v1'; // Hardcoded for now based on context

// ============================================
// 1. CONFIGURE NOTIFICATION HANDLER
// ============================================
export function configureNotificationHandler() {
    Notifications.setNotificationHandler({
        handleNotification: async () => {
            const general = await AsyncStorage.getItem(NOTIFICATION_SETTINGS.GENERAL);
            const sound = await AsyncStorage.getItem(NOTIFICATION_SETTINGS.SOUND);

            // Default to true if not set
            const showAlert = general !== 'false';
            const playSound = sound !== 'false';

            return {
                shouldShowAlert: showAlert,
                shouldPlaySound: playSound,
                shouldSetBadge: true,
                shouldShowBanner: showAlert,
                shouldShowList: showAlert,
            };
        },
    });
}

// ============================================
// 2. REQUEST PERMISSION
// ============================================
export async function requestNotificationPermission(): Promise<boolean> {
    if (!Device.isDevice) {
        // console.log('⚠️ Push notifications only work on physical devices');
        return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        // console.log('❌ User refused notification permissions');
        return false;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: 'default',
            enableVibrate: true,
            showBadge: true,
        });

        // Reminder channel example
        await Notifications.setNotificationChannelAsync('reminder', {
            name: 'Activity Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 500, 250, 500],
            lightColor: '#FF9800',
            sound: 'default',
        });
    }

    // console.log('✅ Notification permission granted');
    return true;
}

// ============================================
// 3. GET EXPO PUSH TOKEN
// ============================================
export async function getExpoPushToken(): Promise<string | null> {
    try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId
            ?? Constants.easConfig?.projectId ?? '3676cdf7-c5c2-4df7-a23e-2e6ab438b344';

        if (!projectId) {
            console.error('❌ Project ID not found');
            return null;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
        });

        const token = tokenData.data;
        // console.log('📱 Expo Push Token:', token);

        await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
        return token;
    } catch (error) {
        console.error('❌ Error getting Expo Push Token:', error);
        return null;
    }
}

// ============================================
// 4. SEND TOKEN TO BACKEND
// ============================================
export async function sendTokenToBackend(authToken: string): Promise<boolean> {
    try {
        const fcmToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);

        if (!fcmToken) {
            // console.log('⚠️ No FCM token to send');
            return false;
        }

        const sentToken = await AsyncStorage.getItem(FCM_TOKEN_SENT_KEY);
        if (sentToken === fcmToken) {
            //   console.log('ℹ️ Token already sent');
            return true;
        }

        const response = await fetch(`${API_URL}/notifications/fcm-token`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ fcmToken })
        });

        if (response.ok) {
            await AsyncStorage.setItem(FCM_TOKEN_SENT_KEY, fcmToken);
            // console.log('✅ FCM token sent to backend');
            return true;
        } else {
            console.error('❌ Failed to send FCM token to backend');
            return false;
        }
    } catch (error) {
        console.error('❌ Network error sending FCM token:', error);
        return false;
    }
}

// ============================================
// 5. REMOVE TOKEN FROM BACKEND (LOGOUT)
// ============================================
export async function removeTokenFromBackend(authToken: string): Promise<void> {
    try {
        await fetch(`${API_URL}/notifications/fcm-token`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        await AsyncStorage.removeItem(FCM_TOKEN_SENT_KEY);
        // Optional: Keep the FCM_TOKEN_KEY locally as device token hasn't changed, 
        // just the association with the user on backend
        // console.log('✅ FCM token removed from backend');
    } catch (error) {
        console.error('❌ Error removing FCM token:', error);
    }
}

// ============================================
// 6. HELPER FUNCTIONS
// ============================================
export async function getLastNotificationResponse() {
    return await Notifications.getLastNotificationResponseAsync();
}

export async function getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
}

export async function setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
}

export async function dismissAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
}

// Compatibility wrapper for previous implementation if needed
export async function registerForPushNotificationsAsync() {
    const granted = await requestNotificationPermission();
    if (granted) {
        return await getExpoPushToken();
    }
    return null;
}

// ... (existing exports)

// ============================================
// 7. NOTIFICATION API METHODS
// ============================================

export interface NotificationItem {
    notificationId: number;
    title: string;
    body: string;
    type: string;
    data: any; // Flexible data object
    isRead: boolean;
    isSent: boolean;
    createAt: string; // ISO string 2026-01-11T18:58:53.548Z
}

export async function fetchNotifications(authToken: string): Promise<NotificationItem[]> {
    try {
        const response = await fetch(`${API_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (response.ok) {
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                return result.data;
            }
            console.warn('Unexpected notification API response structure:', result);
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
    return [];
}

export async function fetchUnreadCount(authToken: string): Promise<number> {
    try {
        const response = await fetch(`${API_URL}/notifications/unread-count`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (response.ok) {
            const result = await response.json();
            if (result.success && typeof result.data === 'number') {
                return result.data;
            }
        }
    } catch (error) {
        console.error('Error fetching unread count:', error);
    }
    return 0;
}

export async function markNotificationAsRead(id: number, authToken: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (response.ok) {
            const result = await response.json();
            return result.success === true;
        }
        return false;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }
}

export async function markAllNotificationsAsRead(authToken: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/notifications/read-all`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (response.ok) {
            const result = await response.json();
            return result.success === true;
        }
        return false;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
    }
}
