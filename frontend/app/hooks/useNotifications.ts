import { useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import {
    configureNotificationHandler,
    requestNotificationPermission,
    getExpoPushToken,
    sendTokenToBackend,
    getLastNotificationResponse,
    setBadgeCount,
} from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

// Types for backend notification data
interface NotificationData {
    type: 'REMINDER' | 'ATTENDANCE_COMPLETED' | 'ENROLLMENT_APPROVED' | 'GENERAL';
    activityId?: string;
    enrollmentId?: string;
    screen?: string; // Fallback for direct navigation
    [key: string]: any;
}

export function useNotifications() {
    const router = useRouter();
    const { token: authToken, user } = useAuth(); // Assuming 'token' is the auth token

    // Refs to store subscriptions
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);

    // ============================================
    // HANDLE FOREGROUND NOTIFICATION
    // ============================================
    const handleNotificationReceived = useCallback(
        (notification: Notifications.Notification) => {
            // console.log('📬 Foreground Notification:', notification);

            const data = notification.request.content.data as NotificationData;

            // Update badge or other UI elements here if needed
            // Currently alert/banner is handled by setNotificationHandler
        },
        []
    );

    // ============================================
    // NAVIGATE BASED ON DATA
    // ============================================
    const navigateFromNotification = useCallback(
        (data: NotificationData) => {
            if (!data) return;

            console.log("Navigating from notification data:", data);

            if (data.activityId) {
                // Route to activity detail
                // Using as any to bypass strict typing for dynamic IDs
                router.push({
                    pathname: '/activity-detail',
                    params: { activityId: data.activityId }
                } as any);
            } else if (data.screen) {
                router.push(data.screen as any);
            } else {
                // Default navigation
                router.push('/notifications' as any);
            }
        },
        [router]
    );

    // ============================================
    // HANDLE USER TAP RESPONSE
    // ============================================
    const handleNotificationResponse = useCallback(
        (response: Notifications.NotificationResponse) => {
            // console.log('👆 User tapped notification:', response);

            const data = response.notification.request.content.data as NotificationData;
            navigateFromNotification(data);
        },
        [navigateFromNotification]
    );

    // ============================================
    // INIT ON MOUNT
    // ============================================
    useEffect(() => {
        // Configure handler once
        configureNotificationHandler();

        // Request permissions
        requestNotificationPermission();

        // Foreground Listener
        notificationListener.current = Notifications.addNotificationReceivedListener(
            handleNotificationReceived
        );

        // Response Listener (Tap)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            handleNotificationResponse
        );

        // Check for "Killed State" launch
        getLastNotificationResponse().then((response) => {
            if (response) {
                console.log('🚀 App launched from notification:', response);
                const data = response.notification.request.content.data as NotificationData;

                // Small delay to ensure navigation container is ready
                setTimeout(() => {
                    navigateFromNotification(data);
                }, 1000);
            }
        });

        // Cleanup
        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    // ============================================
    // REGISTER TOKEN ON LOGIN
    // ============================================
    useEffect(() => {
        const register = async () => {
            if (authToken && user) {
                const pushToken = await getExpoPushToken();
                if (pushToken) {
                    await sendTokenToBackend(authToken);
                }
            }
        };
        register();
    }, [authToken, user]);

    return {
        setBadgeCount,
    };
}
