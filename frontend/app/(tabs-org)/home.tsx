import React from 'react';
import { View, Text, StyleSheet, Image, TextInput, ScrollView, TouchableOpacity, FlatList, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// API Interface
interface Activity {
    activityId: number;
    title: string;
    shortDescription: string;
    imageUrl?: string; // Updated from schema
    category: string;
    theNumberOfCtxhDay: number;
    startDateTime: string;
    endDateTime: string;
    address: string;
    maxParticipants: number;
    approvedParticipants: number;
    remainingSlots: number;
    status: string;
    createdAt: string;
    organizer: string;
}

import { useAuth } from '../context/AuthContext';

export default function OrgHomeScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest'>('newest');
    const [filterType, setFilterType] = React.useState<'All' | 'EDUCATION_SUPPORT' | 'SOCIAL_SUPPORT' | 'COMMUNITY_SERVICE' | 'ENVIRONMENT' | 'HEALTH_CAMPAIGN' | 'EVENT_SUPPORT' | 'FUNDRAISING' | 'OTHER'>('All');

    // API Data State
    const [activities, setActivities] = React.useState<Activity[]>([]);
    const [loading, setLoading] = React.useState(true);

    const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);

    const [currentPage, setCurrentPage] = React.useState(1);
    const ITEMS_PER_PAGE = 8; // Increased for better view
    const [statusFilter, setStatusFilter] = React.useState<'All' | 'Upcoming' | 'Ongoing' | 'Ended'>('All');

    // Fetch API
    React.useEffect(() => {
        const fetchActivities = async () => {
            if (!token) return;

            try {
                const url = 'https://marg-astonishing-matthias.ngrok-free.dev/api/v1/activities';
                // console.log("ORG_HOME: Fetching activities from:", url);
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const json = await response.json();
                // console.log("ORG_HOME: API Response:", JSON.stringify(json, null, 2));

                if (json.success && json.data) {
                    setActivities(json.data);
                } else {
                }
            } catch (error) {
                console.error("ORG_HOME: Failed to fetch activities:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [token]);

    const filteredActivities = React.useMemo(() => {
        let result = activities;

        // 1. Filter by Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Filter by Type
        if (filterType !== 'All') {
            result = result.filter(item => item.category === filterType);
        }

        // 3. Filter by Status
        if (statusFilter !== 'All') {
            if (statusFilter === 'Upcoming') {
                result = result.filter(item => item.status === 'OPEN');
            }
            // Add other status mappings if needed
        }

        // 4. Sort by Date Posted (createdAt)
        result = result.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [searchQuery, sortOrder, filterType, statusFilter, activities]);

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, sortOrder, filterType, statusFilter]);

    // Calculate Counts dynamically
    const upcomingCount = activities.filter(a => a.status === 'OPEN').length;
    const ongoingCount = 0;
    const endedCount = 0;

    const handleStatusClick = (status: 'Upcoming' | 'Ongoing' | 'Ended') => {
        setStatusFilter(prev => prev === status ? 'All' : status);
    };

    const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
    const paginatedActivities = filteredActivities.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const toggleSort = () => {
        setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
    };

    const selectFilter = (type: typeof filterType) => {
        setFilterType(type);
        setShowFilterDropdown(false);
    };

    const ACTIVITY_CATEGORIES = [
        'All',
        'EDUCATION_SUPPORT',
        'SOCIAL_SUPPORT',
        'COMMUNITY_SERVICE',
        'ENVIRONMENT',
        'HEALTH_CAMPAIGN',
        'EVENT_SUPPORT',
        'FUNDRAISING',
        'OTHER'
    ];

    const DEFAULT_IMAGES = [
        require('../../assets/images/ob1.png'),
        require('../../assets/images/ob2.png'),
        require('../../assets/images/ob3.png'),
    ];

    const renderActivityItem = ({ item }: { item: Activity }) => {
        const imageSource = item.imageUrl ? { uri: item.imageUrl } : DEFAULT_IMAGES[item.activityId % DEFAULT_IMAGES.length];

        return (
            <View style={styles.activityCard}>
                <View>
                    <Image source={imageSource} style={styles.activityImage} resizeMode="cover" />
                    <View style={[styles.statusContainerAbsolute,
                    item.status === 'OPEN' ? { backgroundColor: '#E8F5E9' } : { backgroundColor: '#FFEBEE' }
                    ]}>
                        <Text style={[styles.statusTextAbsolute,
                        item.status === 'OPEN' ? { color: '#2E7D32' } : { color: '#C62828' }
                        ]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.activityTitle} numberOfLines={1}>{item.title}</Text>

                    <View style={styles.organizerRow}>
                        <Ionicons name="person-circle-outline" size={14} color="#666" />
                        <Text style={styles.organizerText} numberOfLines={1}>Organization</Text>
                    </View>

                    {/* Details Section */}
                    <View style={{ marginBottom: 8 }}>
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar-outline" size={12} color="#888" />
                            <Text style={styles.detailText}>{new Date(item.startDateTime).toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="location-outline" size={12} color="#888" />
                            <Text style={styles.detailText} numberOfLines={1}>{item.address}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="ribbon-outline" size={12} color="#FF9800" />
                            <Text style={[styles.detailText, { color: '#FF9800', fontWeight: 'bold' }]}>
                                +{item.theNumberOfCtxhDay} days
                            </Text>
                        </View>
                    </View>

                    {/* Divider Line */}
                    <View style={styles.divider} />

                    <View style={styles.cardFooter}>
                        <View style={styles.slotContainer}>
                            <Ionicons name="people-outline" size={14} color="#555" />
                            <Text style={styles.slotText}>{item.remainingSlots}/{item.maxParticipants}</Text>
                        </View>
                        <TouchableOpacity style={styles.viewDetailsButton} onPress={() => router.push({
                            pathname: '/(tabs-org)/activity', // Navigate to manage activity
                            params: {
                                screen: 'update-activity',
                                activityId: item.activityId
                            }
                        })}>
                            <Text style={styles.viewDetailsText}>Manage</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.menuIcon} onPress={() => router.push('/notifications')}>
                        <Ionicons name="notifications-outline" size={28} color="#333" />
                    </TouchableOpacity>
                    <Image source={require('../../assets/images/logo_univolun.png')} style={styles.headerLogo} resizeMode="contain" />
                    <TouchableOpacity onPress={() => router.push('/(tabs-org)/profile')}>
                        <Image source={require('../../assets/images/student_image.png')} style={styles.avatar} />
                    </TouchableOpacity>
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

                {/* All Activity Title & Filters */}
                <View style={[styles.sectionHeader, { zIndex: 10 }]}>
                    <Text style={styles.sectionTitle}>All Activity</Text>
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
                                        borderColor: filterType !== 'All' ? '#FF4058' : '#ddd' // Highlight border if active
                                    }
                                ]}
                                onPress={() => setShowFilterDropdown(!showFilterDropdown)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    filterType !== 'All' && { color: '#FF4058' } // Highlight text if active
                                ]}>Filter ▼</Text>
                            </TouchableOpacity>

                            {/* Dropdown Menu */}
                            {showFilterDropdown && (
                                <View style={styles.dropdownMenu}>
                                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                                        {ACTIVITY_CATEGORIES.map((type) => (
                                            <TouchableOpacity
                                                key={type}
                                                style={[styles.dropdownItem, filterType === type && styles.dropdownItemActive]}
                                                onPress={() => selectFilter(type as any)}
                                            >
                                                <Text style={[styles.dropdownText, filterType === type && styles.dropdownTextActive]}>
                                                    {type.replace('_', ' ')}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Status Circles (Upcoming, Ongoing, Ended) */}
                <View style={styles.statusContainer}>
                    <TouchableOpacity
                        style={[styles.statusItem, { opacity: (statusFilter === 'All' || statusFilter === 'Upcoming') ? 1 : 0.3 }]}
                        onPress={() => handleStatusClick('Upcoming')}
                    >
                        <View style={[styles.circle, { borderColor: '#009688', backgroundColor: statusFilter === 'Upcoming' ? '#E0F2F1' : '#333' }]}>
                            <Text style={[styles.statusCount, statusFilter === 'Upcoming' && { color: '#009688' }]}>{upcomingCount}</Text>
                            <Text style={[styles.statusLabelSmall, statusFilter === 'Upcoming' && { color: '#009688' }]}>Events</Text>
                        </View>
                        <Text style={[styles.statusLabel, statusFilter === 'Upcoming' && { color: '#009688' }]}>UPCOMING</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.statusItem, { opacity: (statusFilter === 'All' || statusFilter === 'Ongoing') ? 1 : 0.3 }]}
                        onPress={() => handleStatusClick('Ongoing')}
                    >
                        <View style={[styles.circle, { borderColor: '#FF9800', backgroundColor: statusFilter === 'Ongoing' ? '#FFF3E0' : '#333' }]}>
                            <Text style={[styles.statusCount, statusFilter === 'Ongoing' && { color: '#FF9800' }]}>{ongoingCount}</Text>
                            <Text style={[styles.statusLabelSmall, statusFilter === 'Ongoing' && { color: '#FF9800' }]}>Events</Text>
                        </View>
                        <Text style={[styles.statusLabel, statusFilter === 'Ongoing' && { color: '#FF9800' }]}>ONGOING</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.statusItem, { opacity: (statusFilter === 'All' || statusFilter === 'Ended') ? 1 : 0.3 }]}
                        onPress={() => handleStatusClick('Ended')}
                    >
                        <View style={[styles.circle, { borderColor: '#4CAF50', backgroundColor: statusFilter === 'Ended' ? '#E8F5E9' : '#333' }]}>
                            <Text style={[styles.statusCount, statusFilter === 'Ended' && { color: '#4CAF50' }]}>{endedCount}</Text>
                            <Text style={[styles.statusLabelSmall, statusFilter === 'Ended' && { color: '#4CAF50' }]}>Events</Text>
                        </View>
                        <Text style={[styles.statusLabel, statusFilter === 'Ended' && { color: '#4CAF50' }]}>ENDED</Text>
                    </TouchableOpacity>
                </View>

                {/* Banner */}
                <ImageBackground
                    source={require('../../assets/images/banner.png')}
                    style={styles.banner}
                    resizeMode="cover"
                    imageStyle={{ borderRadius: 16 }}
                >
                    <View style={styles.bannerContent}>
                        <Text style={styles.bannerTitle}>{upcomingCount} ACTIVITIES</Text>
                        <Text style={styles.bannerSubtitle}>IS OPEN</Text>
                        <TouchableOpacity style={styles.checkNowButton} onPress={() => setStatusFilter('Upcoming')}>
                            <Text style={styles.checkNowText}>CHECK NOW →</Text>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>

                {/* Activity List */}
                <View style={styles.listContainer}>
                    <FlatList
                        data={paginatedActivities}
                        renderItem={renderActivityItem}
                        keyExtractor={item => item.activityId.toString()}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        scrollEnabled={false}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="clipboard-outline" size={48} color="#ccc" />
                                <Text style={styles.emptyText}>No activities found</Text>
                            </View>
                        )}
                    />
                </View>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <View style={styles.paginationContainer}>
                        <TouchableOpacity
                            style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                            onPress={prevPage}
                            disabled={currentPage === 1}
                        >
                            <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#ccc' : '#333'} />
                        </TouchableOpacity>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 5 }}
                            style={{ flexGrow: 0 }}
                        >
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <TouchableOpacity
                                    key={page}
                                    style={[
                                        styles.pageNumberButton,
                                        currentPage === page && styles.pageNumberButtonActive
                                    ]}
                                    onPress={() => setCurrentPage(page)}
                                >
                                    <Text style={[
                                        styles.pageNumberText,
                                        currentPage === page && styles.pageNumberTextActive
                                    ]}>{page}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                            onPress={nextPage}
                            disabled={currentPage === totalPages}
                        >
                            <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? '#ccc' : '#333'} />
                        </TouchableOpacity>
                    </View>
                )}

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
    headerLogo: {
        width: 100,
        height: 40,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 25,
    },
    searchInput: {
        flex: 1,
        marginHorizontal: 10,
        fontSize: 16,
        color: '#333',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
    },
    filterContainer: {
        flexDirection: 'row',
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    filterText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '600',
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 30,
    },
    statusItem: {
        alignItems: 'center',
    },
    circle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#333', // Dark background as per design
        marginBottom: 8,
    },
    statusCount: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    statusLabelSmall: {
        color: '#aaa',
        fontSize: 10,
    },
    statusLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    banner: {
        backgroundColor: '#FBEDED', // Light Pink
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        height: 150,
        overflow: 'hidden',
    },
    bannerContent: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    bannerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    checkNowButton: {
        backgroundColor: '#000',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    checkNowText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    listContainer: {
        flex: 1,
    },
    activityCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        width: '48%', // For Grid
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    activityImage: {
        width: '100%',
        height: 110,
    },
    statusContainerAbsolute: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusTextAbsolute: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardContent: {
        padding: 10,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2, // Reduced from 6
        color: '#222',
        // Removed fixed height to reduce gap
    },
    organizerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    organizerText: {
        fontSize: 11,
        color: '#666',
        marginLeft: 4,
        flex: 1,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2, // Reduced margin
    },
    detailText: {
        fontSize: 10, // Sligthly smaller
        color: '#888',
        marginLeft: 6,
    },
    deadlineText: {
        fontSize: 10,
        color: '#D32F2F',
        marginTop: 4,
        fontStyle: 'italic',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F5F5F5',
        marginVertical: 6,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    slotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    slotText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#555',
        marginLeft: 4,
    },
    viewDetailsButton: {
        backgroundColor: '#FF4058',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },
    viewDetailsText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
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
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    pageButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 15,
    },
    pageButtonDisabled: {
        opacity: 0.5,
    },
    pageNumberButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    pageNumberButtonActive: {
        backgroundColor: '#FF4058',
    },
    pageNumberText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    pageNumberTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        marginTop: 10,
        color: '#888',
        fontSize: 16,
    }
});
