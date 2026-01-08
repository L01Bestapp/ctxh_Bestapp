import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Mock Data
const NOTIFICATIONS_DATA = [
    {
        id: '1',
        title: 'Registration Successful',
        message: 'You have successfully registered for "Green Earth Cleanup".',
        time: '2 hours ago',
        icon: 'checkmark-circle',
        color: '#4CAF50',
        read: false,
    },
    {
        id: '2',
        title: 'New Event Nearby',
        message: 'Check out the new "Blood Donation Drive" happening near you.',
        time: '5 hours ago',
        icon: 'location',
        color: '#2196F3',
        read: false,
    },
    {
        id: '3',
        title: 'Activity Reminder',
        message: 'Don\'t forget, "Tech for Community" starts tomorrow at 08:00 AM.',
        time: '1 day ago',
        icon: 'alarm',
        color: '#FF9800',
        read: true,
    },
    {
        id: '4',
        title: 'Certificate Earned',
        message: 'Congratulations! You earned a certificate for "Coding Bootcamp".',
        time: '2 days ago',
        icon: 'ribbon',
        color: '#9C27B0',
        read: true,
    },
    {
        id: '5',
        title: 'System Update',
        message: 'We have updated our privacy policy. Please review the changes.',
        time: '1 week ago',
        icon: 'information-circle',
        color: '#607D8B',
        read: true,
    },
];

type FilterType = 'All' | 'Unread' | 'Read';

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = React.useState(NOTIFICATIONS_DATA);
    const [filter, setFilter] = React.useState<FilterType>('All');

    const handleClearAll = () => {
        if (notifications.length === 0) return;

        Alert.alert(
            "Clear all notifications?",
            "This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear All",
                    style: "destructive",
                    onPress: () => setNotifications([])
                }
            ]
        );
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(item =>
            item.id === id ? { ...item, read: true } : item
        ));
    };

    const filteredNotifications = React.useMemo(() => {
        if (filter === 'All') return notifications;
        if (filter === 'Unread') return notifications.filter(n => !n.read);
        if (filter === 'Read') return notifications.filter(n => n.read);
        return notifications;
    }, [notifications, filter]);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.itemContainer, !item.read && styles.unreadItem]}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.textContainer}>
                <View style={styles.topRow}>
                    <Text style={[styles.title, !item.read && styles.unreadText]}>{item.title}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
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

                {/* Clear All Button */}
                <TouchableOpacity onPress={handleClearAll} style={styles.clearButton} disabled={notifications.length === 0}>
                    <Text style={[styles.clearText, notifications.length === 0 && styles.clearTextDisabled]}>Clear</Text>
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {(['All', 'Unread', 'Read'] as FilterType[]).map((f) => {
                    const isActive = filter === f;
                    const unreadCount = notifications.filter(n => !n.read).length;

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
                {filteredNotifications.length > 0 ? (
                    <FlatList
                        data={filteredNotifications}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
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
    // ... (header styles kept simplified)
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
