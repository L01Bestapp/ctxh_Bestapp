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
    markNotificationAsRead,
} from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

// Types for backend notification data
interface NotificationData {
    type: 'REMINDER' | 'ATTENDANCE_COMPLETED' | 'ENROLLMENT_APPROVED' | 'ENROLLMENT_REJECTED' | 'ENROLLMENT_CREATED' | 'ACTIVITY_UPDATED' | 'ACTIVITY_CANCELLED' | 'GENERAL' | string;
    notificationId?: number | string; // ID from backend to mark as read
    activityId?: string;
    enrollmentId?: string;
    screen?: string; // Fallback for direct navigation
    [key: string]: any;
}

export function useNotifications(shouldInit: boolean = true) {
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

            switch (data.type) {
                case 'ENROLLMENT_CREATED':
                    if (data.activityId) {
                        router.push({
                            pathname: '/handle-request',
                            params: { activityId: data.activityId }
                        } as any);
                    }
                    break;

                case 'REMINDER':
                    if (data.activityId) {
                        router.push({
                            pathname: '/activity-detail-student',
                            params: { activityId: data.activityId }
                        } as any);
                    }
                    break;

                case 'ATTENDANCE_COMPLETED':
                    if (data.activityId) {
                        router.push({
                            pathname: '/history-detail',
                            params: { activityId: data.activityId }
                        } as any);
                    }
                    break;

                case 'ENROLLMENT_APPROVED':
                case 'ENROLLMENT_REJECTED':
                    if (data.activityId) {
                        router.push({
                            pathname: '/activity-detail-student',
                            params: {
                                id: data.activityId,
                                activityId: data.activityId,
                                isRegistered: 'true',
                                enrollmentStatus: data.type === 'ENROLLMENT_APPROVED' ? 'APPROVED' : 'REJECTED'
                            }
                        } as any);
                    }
                    break;

                case 'ACTIVITY_UPDATED':
                case 'ACTIVITY_CANCELLED':
                case 'GENERAL':
                default:
                    if (data.activityId) {
                        // Default to activity detail if ID is present
                        router.push({
                            pathname: '/activity-detail-student',
                            params: { activityId: data.activityId }
                        } as any);
                    } else if (data.screen) {
                        router.push(data.screen as any);
                    } else {
                        // Default navigation
                        router.push('/notifications' as any);
                    }
                    break;
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

            // Optimistically Mark as Read if ID exists
            if (data.notificationId && authToken) {
                // console.log(`👉 [Notification] Auto-marking #${data.notificationId} as read.`);
                markNotificationAsRead(Number(data.notificationId), authToken);
            }

            navigateFromNotification(data);
        },
        [navigateFromNotification, authToken]
    );

    // ============================================
    // INIT ON MOUNT
    // ============================================
    useEffect(() => {
        if (!shouldInit) return;

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

                // Optimistically Mark as Read (Killed State)
                if (data.notificationId && authToken) {
                    markNotificationAsRead(Number(data.notificationId), authToken);
                }

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
                // Ensure permission is granted before getting token
                // valid even if called multiple times (checks status)
                const granted = await requestNotificationPermission();
                if (granted) {
                    const pushToken = await getExpoPushToken();
                    if (pushToken) {
                        await sendTokenToBackend(authToken);
                    }
                }
            }
        };
        register();
    }, [authToken, user]);

    return {
        setBadgeCount,
        handleNotificationNavigation: navigateFromNotification
    };
}
