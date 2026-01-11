import React from 'react';
import { View, Text, StyleSheet, Image, TextInput, ScrollView, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import HeaderAvatar from '../components/HeaderAvatar';

export default function StudentActivityScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const [requests, setRequests] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    const [searchQuery, setSearchQuery] = React.useState('');
    const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest'>('newest');
    const [filterStatus, setFilterStatus] = React.useState<'All' | 'Accepted' | 'Pending' | 'Rejected'>('All');
    const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);

    useFocusEffect(
        React.useCallback(() => {
            fetchRequests();
        }, [token])
    );

    const fetchRequests = async () => {
        if (!token) return;
        try {
            const response = await fetch(`https://marg-astonishing-matthias.ngrok-free.dev/api/v1/enrollments/my-requests?t=${Date.now()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const json = await response.json();
            if (json.success && Array.isArray(json.data)) {
                // Map API data to UI structure
                const mapped = json.data.map((item: any) => ({
                    id: item.enrollmentId.toString(),
                    title: item.activityTitle,
                    organizer: item.organizationName || 'Unknown Org',
                    description: item.shortDescription || '',
                    time: formatDateTime(item.startDateTime),
                    location: item.address || 'N/A',
                    status: mapStatus(item.enrollmentStatus),
                    image: require('../../assets/images/alternative.png'), // No image in API yet
                    ctxh: `+${item.benefitsCtxh || 0} days`, // Assuming days based on previous
                    statusMessage: getStatusMessage(item.enrollmentStatus),
                    createdAt: item.appliedAt || new Date().toISOString(),
                    raw: item // Keep raw data for details
                }));
                setRequests(mapped);
            }
        } catch (error) {
            console.error("Fetch Requests Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const mapStatus = (apiStatus: string) => {
        if (apiStatus === 'APPROVED') return 'Accepted';
        if (apiStatus === 'REJECTED') return 'Rejected';
        return 'Pending';
    };

    const getStatusMessage = (apiStatus: string) => {
        if (apiStatus === 'APPROVED') return 'Your request to join the activity has been accepted by the organizer';
        if (apiStatus === 'REJECTED') return 'Your request has been rejected by the organizer';
        return 'You have registered, please wait for the organizer to review';
    };

    const formatDateTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const d = date.toLocaleDateString('en-GB'); // dd/mm/yyyy
            const t = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `${d} ${t}`;
        } catch (e) { return dateStr; }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchRequests();
    }, [token]);

    const filteredRequests = React.useMemo(() => {
        let result = requests;

        // 1. Filter by Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(item =>
                (item.title || '').toLowerCase().includes(lowerQuery) ||
                (item.organizer || '').toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Filter by Status
        if (filterStatus !== 'All') {
            result = result.filter(item => item.status === filterStatus);
        }

        // 3. Sort by Date
        result = result.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [requests, searchQuery, sortOrder, filterStatus]);

    const toggleSort = () => {
        setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
    };

    const handleCancelRequest = (id: string, title: string) => {
        Alert.alert(
            "Cancel Registration",
            `Are you sure you want to cancel your registration for "${title}"?`,
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://marg-astonishing-matthias.ngrok-free.dev/api/v1/enrollments/${id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            });

                            // Check for 204 No Content or success JSON
                            if (response.status === 204 || response.ok) {
                                setRequests(prev => prev.filter(item => item.id !== id));
                                Alert.alert("Success", "Your registration has been cancelled.");
                            } else {
                                const json = await response.json();
                                Alert.alert("Error", json.message || "Failed to cancel.");
                            }
                        } catch (error) {
                            console.error("Cancel Error:", error);
                            Alert.alert("Error", "Network error. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    const renderRequestItem = ({ item }: { item: any }) => {
        // Colors mapping
        let statusColor = '#FFC107'; // Pending
        if (item.status === 'Accepted') statusColor = '#4CAF50';
        if (item.status === 'Rejected') statusColor = '#F44336';

        return (
            <View style={styles.activityCard}>
                {/* Left Image Section */}
                <View style={styles.imageContainer}>
                    <Image source={item.image} style={styles.activityImage} resizeMode="cover" />
                </View>

                {/* Right Content Section */}
                <View style={styles.contentContainer}>
                    {/* Title */}
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>

                    {/* Organizer */}
                    <View style={styles.organizerRow}>
                        <Ionicons name="people-outline" size={12} color="#666" />
                        <Text style={styles.organizerText} numberOfLines={1}>{item.organizer}</Text>
                    </View>

                    {/* Description */}
                    <Text style={styles.descriptionLabel}>Description:</Text>
                    <Text style={styles.descriptionText} numberOfLines={2}>{item.description}</Text>

                    {/* Details Grid */}
                    <View style={styles.detailsGrid}>
                        <View style={[styles.detailRow, { width: '100%', marginBottom: 4 }]}>
                            <Ionicons name="calendar-outline" size={12} color="#888" />
                            <Text style={styles.detailText}>{item.time}</Text>
                        </View>
                        <View style={[styles.detailRow, { width: '100%', marginBottom: 4 }]}>
                            <Ionicons name="location-outline" size={12} color="#F44336" />
                            <Text style={styles.detailText} numberOfLines={1}>{item.location}</Text>
                        </View>
                        <View style={[styles.detailRow, { width: '100%', marginBottom: 4 }]}>
                            <Ionicons name="ribbon-outline" size={12} color="#4CAF50" />
                            <Text style={[styles.detailText, { color: '#4CAF50', fontWeight: 'bold' }]}>{item.ctxh}</Text>
                        </View>

                        {/* Status Indicator (Small) */}
                        <View style={[styles.detailRow, { width: '100%', marginBottom: 4 }]}>
                            <Ionicons name="ellipse" size={10} color={statusColor} />
                            <Text style={[styles.detailText, { fontWeight: 'bold', color: statusColor }]}>
                                {item.status}
                            </Text>
                        </View>
                    </View>

                    {/* Status Message */}
                    <Text style={[styles.statusMessage, { color: statusColor }]}>
                        {item.statusMessage}
                    </Text>

                    {/* Footer: Action Buttons */}
                    <View style={styles.cardFooter}>
                        {/* Status Badge */}
                        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                            <Text style={styles.statusBadgeText}>{item.status}</Text>
                        </View>

                        {/* Action Button */}
                        {item.status === 'Accepted' ? (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#6200EE' }]} // Purple for Detail
                                onPress={() => router.push({
                                    pathname: '/activity-detail-student',
                                    params: {
                                        id: item.raw.activityId,
                                        isRegistered: 'true',
                                        enrollmentStatus: item.raw.enrollmentStatus
                                    }
                                })}
                            >
                                <Text style={styles.actionButtonText}>Detail</Text>
                            </TouchableOpacity>
                        ) : item.status === 'Pending' ? (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#FF4058' }]} // Red for Cancel
                                onPress={() => handleCancelRequest(item.id, item.title)}
                            >
                                <Text style={styles.actionButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        ) : (
                            // Rejected - Maybe Show Contact or just Close
                            <View />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#1A237E" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1A237E']} />}
            >

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Registration request</Text>
                    <HeaderAvatar />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search any request..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <Ionicons name="mic" size={20} color="#999" />
                </View>

                {/* Title & Filters */}
                <View style={[styles.sectionHeader, { zIndex: 10 }]}>
                    <Text style={styles.sectionTitle}>My Request</Text>
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
                                        borderColor: filterStatus !== 'All' ? '#FF4058' : '#ddd'
                                    }
                                ]}
                                onPress={() => setShowFilterDropdown(!showFilterDropdown)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    filterStatus !== 'All' && { color: '#FF4058' }
                                ]}>Filter ▼</Text>
                            </TouchableOpacity>

                            {/* Dropdown Menu */}
                            {showFilterDropdown && (
                                <View style={styles.dropdownMenu}>
                                    {['All', 'Accepted', 'Pending', 'Rejected'].map((status) => (
                                        <TouchableOpacity
                                            key={status}
                                            style={[styles.dropdownItem, filterStatus === status && styles.dropdownItemActive]}
                                            onPress={() => {
                                                setFilterStatus(status as any);
                                                setShowFilterDropdown(false);
                                            }}
                                        >
                                            <Text style={[styles.dropdownText, filterStatus === status && styles.dropdownTextActive]}>{status}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Request List */}
                <View style={styles.listContainer}>
                    <FlatList
                        data={filteredRequests}
                        renderItem={renderRequestItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', marginTop: 50 }}>
                                <Text style={{ color: '#999' }}>No requests found.</Text>
                            </View>
                        }
                    />
                </View>

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
    backButton: { padding: 8, backgroundColor: '#F5F5F5', borderRadius: 50 },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#1A237E' },

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

    // Activity Card Style
    listContainer: { marginBottom: 10 },
    activityCard: {
        flexDirection: 'row', // Horizontal split
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
        // Shadow
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    },
    imageContainer: {
        width: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityImage: {
        width: 270,
        height: 120,
        borderRadius: 6,
        resizeMode: 'cover',
        transform: [{ rotate: '-90deg' }],
    },
    contentContainer: {
        flex: 1,
        padding: 10,
        paddingLeft: 10,
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
    dropdownItem: { paddingVertical: 10, paddingHorizontal: 10, borderRadius: 6 },
    dropdownItemActive: { backgroundColor: '#FFF0F3' },
    dropdownText: { fontSize: 12, color: '#333' },
    dropdownTextActive: { color: '#FF4058', fontWeight: 'bold' },

    title: { fontSize: 15, fontWeight: 'bold', color: '#000', marginBottom: 2 },
    organizerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    organizerText: { fontSize: 10, color: '#666', marginLeft: 4 },
    descriptionLabel: { fontSize: 10, color: '#444', marginTop: 0 },
    descriptionText: { fontSize: 10, color: '#666', fontStyle: 'italic', marginBottom: 6 },
    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
    detailRow: { flexDirection: 'row', alignItems: 'center' },
    detailText: { fontSize: 10, color: '#555', marginLeft: 6 },

    statusMessage: {
        fontSize: 10,
        fontStyle: 'italic',
        marginTop: 5,
        marginBottom: 10,
        lineHeight: 14,
    },

    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        minWidth: 80,
        alignItems: 'center',
    },
    statusBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    actionButton: {
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 6,
        minWidth: 80,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    }
});
