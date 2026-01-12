import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import {
    fetchNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    NotificationItem,
    setBadgeCount,
    fetchUnreadCount
} from '@/services/notificationService';

type FilterType = 'All' | 'Unread' | 'Read';

export default function NotificationsScreen() {
    const router = useRouter();
    const { token: authToken } = useAuth();
    const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [filter, setFilter] = React.useState<FilterType>('All');

    const loadNotifications = useCallback(async () => {
        if (!authToken) return;
        setRefreshing(true);
        const data = await fetchNotifications(authToken);
        // Sort by date desc
        if (data && Array.isArray(data)) {
            data.sort((a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime());
            setNotifications(data);

            // Update badge count
            const unread = data.filter(n => !n.isRead).length;
            setBadgeCount(unread);
        } else {
            setNotifications([]);
        }

        setLoading(false);
        setRefreshing(false);
    }, [authToken]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadNotifications().then(() => setRefreshing(false));
    }, [loadNotifications]);

    const handleMarkAllRead = async () => {
        if (!authToken) return;
        const success = await markAllNotificationsAsRead(authToken);
        if (success) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setBadgeCount(0);
        }
    };

    const handleItemPress = async (item: NotificationItem) => {
        if (!item.isRead && authToken) {
            // Optimistically update UI
            setNotifications(prev =>
                prev.map(n => n.notificationId === item.notificationId ? { ...n, isRead: true } : n)
            );

            // Call API
            const success = await markNotificationAsRead(item.notificationId, authToken);

            // Revert if failed (optional, but good practice)
            if (!success) {
                // console.log("Failed to mark read");
            } else {
                // Update badge count if needed
                const unread = await fetchUnreadCount(authToken);
                setBadgeCount(unread);
            }
        }

        // Handle navigation based on type/data
        if (item.data?.activityId) {
            router.push({
                pathname: '/activity-detail',
                params: { activityId: item.data.activityId }
            } as any);
        }
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'REMINDER': return 'alarm-outline';
            case 'ATTENDANCE_COMPLETED': return 'checkmark-circle-outline';
            case 'ENROLLMENT_APPROVED': return 'school-outline';
            case 'GENERAL': return 'notifications-outline';
            default: return 'notifications-outline';
        }
    };

    const filteredNotifications = React.useMemo(() => {
        if (!notifications) return [];
        if (filter === 'All') return notifications;
        if (filter === 'Unread') return notifications.filter(n => !n.isRead);
        if (filter === 'Read') return notifications.filter(n => n.isRead);
        return notifications;
    }, [notifications, filter]);

    const renderItem = ({ item }: { item: NotificationItem }) => (
        <TouchableOpacity
            style={[styles.itemContainer, !item.isRead && styles.unreadItem]}
            onPress={() => handleItemPress(item)}
        >
            <View style={[styles.iconContainer, !item.isRead && styles.unreadIconContainer]}>
                <Ionicons
                    name={getIconForType(item.type) as any}
                    size={24}
                    color={!item.isRead ? '#2F80ED' : '#888'}
                />
            </View>
            <View style={styles.textContainer}>
                <View style={styles.topRow}>
                    <Text style={[styles.title, !item.isRead && styles.unreadText]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={styles.time}>
                        {new Date(item.createAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <Text style={[styles.message, !item.isRead && styles.unreadBody]} numberOfLines={2}>
                    {item.body}
                </Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>NOTIFICATIONS</Text>

                {/* Mark All Read Button */}
                <TouchableOpacity onPress={handleMarkAllRead} style={styles.clearButton} disabled={notifications.length === 0}>
                    <Text style={[styles.clearText, notifications.length === 0 && styles.clearTextDisabled]}>Read All</Text>
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {(['All', 'Unread', 'Read'] as FilterType[]).map((f) => {
                    const isActive = filter === f;
                    const unreadCount = notifications.filter(n => !n.isRead).length;

                    return (
                        <TouchableOpacity
                            key={f}
                            style={styles.filterTab}
                            onPress={() => setFilter(f)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{f}</Text>

                            {f === 'Unread' && unreadCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{unreadCount}</Text>
                                </View>
                            )}

                            {isActive && <View style={styles.activeIndicator} />}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* List */}
            <View style={{ flex: 1, zIndex: -1 }}>
                {loading && !refreshing ? (
                    <View style={styles.center}>
                        <ActivityIndicator color="#FF4058" />
                    </View>
                ) : filteredNotifications.length > 0 ? (
                    <FlatList
                        data={filteredNotifications}
                        renderItem={renderItem}
                        keyExtractor={item => item.notificationId.toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={loadNotifications} />
                        }
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No {filter.toLowerCase()} notifications</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        zIndex: 10,
    },
    backButton: {
        padding: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 50,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1A237E',
        letterSpacing: 0.5,
    },
    clearButton: {
        padding: 8,
    },
    clearText: {
        color: '#FF4058',
        fontWeight: '600',
        fontSize: 14,
    },
    clearTextDisabled: {
        color: '#ccc',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
        zIndex: 10,
    },
    filterTab: {
        marginRight: 25,
        paddingVertical: 12,
        paddingHorizontal: 4,
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterText: {
        fontSize: 15,
        color: '#999',
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#FF4058',
        fontWeight: 'bold',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#FF4058',
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    badge: {
        backgroundColor: '#FF4058',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    unreadItem: {
        backgroundColor: '#F3F9FF',
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        backgroundColor: '#F5F5F5',
    },
    unreadIconContainer: {
        backgroundColor: '#E3F2FD',
    },
    textContainer: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    unreadText: {
        fontWeight: '800',
        color: '#000',
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    message: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    unreadBody: {
        color: '#333',
        fontWeight: '500',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#2196F3',
        marginLeft: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -50,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#999',
    }
});
