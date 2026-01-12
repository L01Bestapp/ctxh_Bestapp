import React from 'react';
import { View, Text, StyleSheet, Image, TextInput, ScrollView, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import HeaderAvatar from '../components/HeaderAvatar';
import NotificationBell from '../components/NotificationBell';

// API Interface matching schema for get-all-activity-for-organization
interface Activity {
    activityId: number;
    title: string;
    shortDescription: string;
    imageUrl?: string;
    category: string;
    registrationDeadline: string;
    theNumberOfCtxhDay: number;
    startDateTime: string;
    endDateTime: string;
    address: string;
    maxParticipants: number;
    approvedParticipants: number;
    remainingSlots: number;
    registrationState: string;
    activityStatus: string;
    createdAt: string;
}

export default function OrgActivityScreen() {
    const router = useRouter();
    const { token, user } = useAuth();

    // API Data State
    const [activities, setActivities] = React.useState<Activity[]>([]);
    const [loading, setLoading] = React.useState(true);

    const [searchQuery, setSearchQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState<'All' | 'UPCOMING' | 'ONGOING' | 'ENDED'>('All');
    const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest'>('newest');
    const [filterType, setFilterType] = React.useState<'All' | 'EDUCATION_SUPPORT' | 'SOCIAL_SUPPORT' | 'COMMUNITY_SERVICE' | 'ENVIRONMENT' | 'HEALTH_CAMPAIGN' | 'EVENT_SUPPORT' | 'FUNDRAISING' | 'OTHER'>('All');
    const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);

    const [refreshing, setRefreshing] = React.useState(false);

    // Fetch API with Auto-Refresh on Focus
    useFocusEffect(
        React.useCallback(() => {
            fetchActivities();
        }, [token])
    );

    const fetchActivities = async () => {
        if (!token) return;

        try {
            const url = `https://marg-astonishing-matthias.ngrok-free.dev/api/v1/activities/get-all-activity-for-organization?t=${Date.now()}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const json = await response.json();

            if (json.success && json.data) {
                setActivities(json.data);
            }
        } catch (error) {
            console.error("ORG_ACTIVITY: Failed to fetch activities:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchActivities();
    }, [token]);


    // Counts (Dynamic based on current state)
    // Note: API returns uppercase statuses usually, ensuring match
    const upcomingCount = activities.filter(a => a.activityStatus === 'UPCOMING').length;
    const ongoingCount = activities.filter(a => a.activityStatus === 'ONGOING').length;
    const endedCount = activities.filter(a => a.activityStatus === 'ENDED').length;

    const filteredActivities = React.useMemo(() => {
        let result = activities;

        // 1. Filter by Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(item =>
                (item.title || '').toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Filter by Type
        if (filterType !== 'All') {
            result = result.filter(item => item.category === filterType);
        }

        // 3. Filter by Status
        if (statusFilter !== 'All') {
            result = result.filter(item => item.activityStatus === statusFilter);
        }

        // 4. Sort by Date Posted (createdAt)
        result = result.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [activities, searchQuery, sortOrder, filterType, statusFilter]);

    const toggleSort = () => {
        setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
    };

    const selectFilter = (type: typeof filterType) => {
        setFilterType(type);
        setShowFilterDropdown(false);
    };

    const handleStatusClick = (status: 'UPCOMING' | 'ONGOING' | 'ENDED') => {
        setStatusFilter(prev => prev === status ? 'All' : status);
    };

    const confirmDelete = (id: number, title: string) => {
        Alert.alert(
            "Close Activity",
            `Are you sure you want to close "${title}"? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Close Activity",
                    style: "destructive",
                    onPress: () => deleteActivity(id)
                }
            ]
        );
    };

    const deleteActivity = async (id: number) => {
        // console.log("Attempting to delete activity:", id);
        if (!token) return;

        try {
            const response = await fetch(`https://marg-astonishing-matthias.ngrok-free.dev/api/v1/activities/${id}/close`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const json = await response.json();

            if (response.ok && (json.success || json.code === 0)) {
                Alert.alert("Success", "Activity closed successfully.", [
                    { text: "OK", onPress: () => fetchActivities() }
                ]);
            } else {
                Alert.alert("Error", json.message || "Failed to close activity.");
            }
        } catch (error) {
            console.error("Close Activity Error:", error);
            Alert.alert("Error", "Network error. Please try again.");
        }
    };

    const renderActivityItem = ({ item }: { item: Activity }) => {
        const cleanUrl = item.imageUrl ? item.imageUrl.trim() : '';
        const imageSource = (cleanUrl.startsWith('http')) ? { uri: cleanUrl } : require('../../assets/images/alternative.png');

        // Determine Color based on registrationState (OPEN, CLOSED, FULL, etc.)
        let statusColor = '#616161';
        let statusBg = '#EEEEEE';

        const s = (item.registrationState || 'UNKNOWN').toUpperCase();
        if (['OPEN', 'UPCOMING'].includes(s)) {
            statusColor = '#009688';
            statusBg = '#E0F2F1';
        } else if (['ONGOING', 'ON_GOING'].includes(s)) {
            statusColor = '#FF9800';
            statusBg = '#FFF3E0';
        } else if (['ENDED', 'CLOSED', 'COMPLETED'].includes(s)) {
            statusColor = '#616161';
            statusBg = '#EEEEEE';
        } else if (s === 'FULL') {
            statusColor = '#D32F2F';
            statusBg = '#FFEBEE';
        }

        return (
            <View style={styles.activityCard}>
                {/* Left Image Section */}
                <View style={styles.imageContainer}>
                    <Image source={imageSource} style={styles.activityImage} resizeMode="cover" />
                </View>

                {/* Right Content Section */}
                <View style={styles.contentContainer}>
                    {/* Management Actions */}
                    <View style={styles.topActionsRow}>
                        <TouchableOpacity
                            style={[styles.actionButton, { borderColor: '#2196F3' }]}
                            onPress={() => router.push({
                                pathname: '/update-activity',
                                params: {
                                    id: item.activityId
                                }
                            })}
                        >
                            <Text style={[styles.actionButtonText, { color: '#2196F3' }]}>Update Activity</Text>
                        </TouchableOpacity>
                        {!['ENDED', 'CLOSED', 'COMPLETED'].includes(s) && item.activityStatus !== 'ENDED' && (
                            <TouchableOpacity
                                style={[styles.actionButton, { borderColor: '#F44336' }]}
                                onPress={() => confirmDelete(item.activityId, item.title)}
                            >
                                <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Close activity</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Title */}
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>

                    {/* Organizer - Removed as per schema (this is My Activities) */}

                    {/* Description */}
                    <Text style={styles.descriptionLabel}>Description:</Text>
                    <Text style={styles.descriptionText} numberOfLines={2}>{item.shortDescription}</Text>

                    {/* Details Grid */}
                    <View style={styles.detailsGrid}>
                        <View style={[styles.detailRow, { width: '100%', marginBottom: 4 }]}>
                            <Ionicons name="calendar-outline" size={12} color="#888" />
                            <Text style={styles.detailText}>
                                {new Date(item.startDateTime).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={[styles.detailRow, { width: '100%', marginBottom: 4 }]}>
                            <Ionicons name="location-outline" size={12} color="#F44336" />
                            <Text style={styles.detailText} numberOfLines={1}>{item.address}</Text>
                        </View>
                        <View style={[styles.detailRow, { width: '50%', marginBottom: 4 }]}>
                            <Ionicons name="ellipse" size={8} color={statusColor} />
                            <Text style={[styles.statusTextAbsolute, { color: statusColor, marginLeft: 6 }]}>
                                {item.registrationState}
                            </Text>
                        </View>
                        <View style={[styles.detailRow, { width: '50%', marginBottom: 4 }]}>
                            <Ionicons name="ribbon-outline" size={12} color="#FF9800" />
                            <Text style={styles.detailText}>+{item.theNumberOfCtxhDay} days</Text>
                        </View>
                    </View>

                    {/* Deadline Warning */}
                    {item.registrationDeadline && (
                        <View style={{ marginTop: 4, marginBottom: 4 }}>
                            <Text style={styles.deadlineText}>
                                ⚠️ Deadline: {new Date(item.registrationDeadline).toLocaleDateString()}
                            </Text>
                        </View>
                    )}

                    {/* Footer: Slot & Handle Request */}
                    <View style={styles.cardFooter}>
                        <Text style={styles.slotText}>Slot: {item.approvedParticipants}/{item.maxParticipants}</Text>
                        <TouchableOpacity
                            style={styles.handleRequestButton}
                            onPress={() => router.push({
                                pathname: '/handle-request',
                                params: {
                                    activityId: item.activityId,
                                    title: item.title,
                                    slots: `${item.approvedParticipants}/${item.maxParticipants}`
                                }
                            })}
                        >
                            <Text style={styles.handleRequestText}>Handle Request →</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#FF4058" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF4058']} />}
            >

                {/* Header */}
                <View style={styles.header}>
                    <NotificationBell />
                    <Image source={require('../../assets/images/logo_univolun.png')} style={styles.headerLogo} resizeMode="contain" />
                    <HeaderAvatar />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search any Activity..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <Ionicons name="mic" size={20} color="#999" />
                </View>

                {/* Title & Filters */}
                <View style={[styles.sectionHeader, { zIndex: 10 }]}>
                    <Text style={styles.sectionTitle}>My Activity</Text>
                    <View style={styles.filterContainer}>
                        <TouchableOpacity style={styles.filterButton} onPress={toggleSort}>
                            <Text style={styles.filterText}>Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'} ⇅</Text>
                        </TouchableOpacity>

                        <View style={{ position: 'relative' }}>
                            <TouchableOpacity
                                style={[
                                    styles.filterButton,
                                    {
                                        marginLeft: 10,
                                        backgroundColor: showFilterDropdown ? '#eee' : '#fff',
                                        borderColor: filterType !== 'All' ? '#FF4058' : '#ddd'
                                    }
                                ]}
                                onPress={() => setShowFilterDropdown(!showFilterDropdown)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    filterType !== 'All' && { color: '#FF4058' }
                                ]}>Filter ▼</Text>
                            </TouchableOpacity>

                            {/* Dropdown Menu */}
                            {showFilterDropdown && (
                                <View style={styles.dropdownMenu}>
                                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                                        {[
                                            'All',
                                            'EDUCATION_SUPPORT',
                                            'SOCIAL_SUPPORT',
                                            'COMMUNITY_SERVICE',
                                            'ENVIRONMENT',
                                            'HEALTH_CAMPAIGN',
                                            'EVENT_SUPPORT',
                                            'FUNDRAISING',
                                            'OTHER'
                                        ].map((type) => (
                                            <TouchableOpacity
                                                key={type}
                                                style={[styles.dropdownItem, filterType === type && styles.dropdownItemActive]}
                                                onPress={() => selectFilter(type as any)}
                                            >
                                                <Text style={[styles.dropdownText, filterType === type && styles.dropdownTextActive]}>{type.replace('_', ' ')}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Status Circles (Interactive) */}
                <View style={styles.statusContainer}>
                    {['UPCOMING', 'ONGOING', 'ENDED'].map((status) => (
                        <TouchableOpacity
                            key={status}
                            style={[styles.statusItem, { opacity: (statusFilter === 'All' || statusFilter === status) ? 1 : 0.3 }]}
                            onPress={() => handleStatusClick(status as any)}
                        >
                            <View style={[styles.circle,
                            {
                                borderColor: status === 'UPCOMING' ? '#009688' : status === 'ONGOING' ? '#FF9800' : '#4CAF50',
                                backgroundColor: statusFilter === status ? (status === 'UPCOMING' ? '#E0F2F1' : status === 'ONGOING' ? '#FFF3E0' : '#E8F5E9') : '#333'
                            }
                            ]}>
                                <Text style={[styles.statusCount, statusFilter === status && { color: status === 'UPCOMING' ? '#009688' : status === 'ONGOING' ? '#FF9800' : '#4CAF50' }]}>
                                    {status === 'UPCOMING' ? upcomingCount : status === 'ONGOING' ? ongoingCount : endedCount}
                                </Text>
                                <Text style={[styles.statusLabelSmall, statusFilter === status && { color: status === 'UPCOMING' ? '#009688' : status === 'ONGOING' ? '#FF9800' : '#4CAF50' }]}>Events</Text>
                            </View>
                            <Text style={[styles.statusLabel, statusFilter === status && { color: status === 'UPCOMING' ? '#009688' : status === 'ONGOING' ? '#FF9800' : '#4CAF50' }]}>{status}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Create New Activity Button */}
                <TouchableOpacity style={styles.createActivityButton} onPress={() => router.push('/create-activity')}>
                    <Text style={styles.createActivityText}>Create new activity</Text>
                    <Ionicons name="add-circle-outline" size={24} color="#fff" />
                </TouchableOpacity>

                {/* Activity List */}
                <View style={styles.listContainer}>
                    <FlatList
                        data={filteredActivities}
                        renderItem={renderActivityItem}
                        keyExtractor={item => item.activityId.toString()}
                        scrollEnabled={false}
                        ListEmptyComponent={() => (
                            <View style={{ alignItems: 'center', marginTop: 50 }}>
                                <Text style={{ color: '#999' }}>No activities found.</Text>
                            </View>
                        )}
                    />
                </View>

                {/* Create New Activity Button */}


            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    menuIcon: {
        padding: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 50,
    },
    headerLogo: { width: 100, height: 40 },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 25,
    },
    searchInput: { flex: 1, marginHorizontal: 10, fontSize: 16, color: '#333' },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
    filterContainer: { flexDirection: 'row' },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    filterText: { fontSize: 12, color: '#333', fontWeight: '600' },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 30,
    },
    statusItem: { alignItems: 'center' },
    circle: {
        width: 60, height: 60, borderRadius: 30, borderWidth: 3,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#333', marginBottom: 8,
    },
    statusCount: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    statusLabelSmall: { color: '#aaa', fontSize: 9 },
    statusLabel: { fontSize: 11, color: '#666', fontWeight: 'bold' },

    // Activity Card Style
    listContainer: { marginBottom: 10 },
    activityCard: {
        flexDirection: 'row', // Horizontal split
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12, // Reduced spacing
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
        // Shadow
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
        alignItems: 'center',
    },
    imageContainer: {
        width: 120,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 8,
    },
    statusTextAbsolute: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    activityImage: {
        width: 270,
        height: 120, // Explicit Layout Landscape
        borderRadius: 6,
        resizeMode: 'cover',
        transform: [{ rotate: '-90deg' }], // Rotate 90 degrees
    },
    contentContainer: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
    },

    // Dropdown Styles
    dropdownMenu: {
        position: 'absolute',
        top: 35,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        width: 120,
        borderWidth: 1,
        borderColor: '#eee',
        zIndex: 100,
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    dropdownItemActive: {
        backgroundColor: '#FFF0F3',
    },
    dropdownText: {
        fontSize: 12,
        color: '#333',
    },
    dropdownTextActive: {
        color: '#FF4058',
        fontWeight: 'bold',
    },

    topActionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 2,
    },
    actionButton: {
        borderWidth: 1,
        borderRadius: 15,
        paddingHorizontal: 6,
        paddingVertical: 1, // Compact
        marginLeft: 5,
    },
    actionButtonText: {
        fontSize: 9,
        fontWeight: '600',
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 2,
    },
    organizerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    organizerText: {
        fontSize: 10,
        color: '#666',
        marginLeft: 4,
    },
    descriptionLabel: { fontSize: 10, color: '#444', marginTop: 0 },
    descriptionText: {
        fontSize: 10,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 6,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 4,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        // Removed fixed width 50%, letting them stack for better space
    },
    detailText: {
        fontSize: 10,
        color: '#555',
        marginLeft: 6, // More spacing from icon
    },
    deadlineText: {
        fontSize: 10,
        color: '#D32F2F',
        marginBottom: 8,
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
    },
    slotText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#333',
    },
    handleRequestButton: {
        backgroundColor: '#FF4058',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    handleRequestText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    createActivityButton: {
        backgroundColor: '#FF4058',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        borderRadius: 12,
        marginTop: 10,
        marginBottom: 20,
        shadowColor: "#FF4058",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    createActivityText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    }
});
