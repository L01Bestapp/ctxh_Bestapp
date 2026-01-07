import React from 'react';
import { View, Text, StyleSheet, Image, TextInput, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Mock Data for "My Activities" (Managed by Org)
const MY_ACTIVITIES = [
    {
        id: '1',
        title: 'Blood Donation Drive',
        organizer: 'Youth Union, Faculty of CS',
        description: 'Donate blood, save lives - your kindness matters.',
        time: 'Oct 20, 2025 - 08:00 AM',
        location: 'Hall B1, HCMUT',
        status: 'Upcoming',
        slots: '15/20',
        image: require('../../assets/images/ob1.png'),
        deadline: 'Oct 22',
        ctxh: '+2 volunteer hours',
        createdAt: '2025-09-01T10:00:00Z',
        type: 'Volunteer'
    },
    {
        id: '2',
        title: 'Campus Green Day',
        organizer: 'Youth Union, Faculty of CS',
        description: "Let's plant new trees, clean up the yard, and spread positive energy.",
        time: 'Oct 20, 2025 - 07:30 AM',
        location: 'Hall B1, HCMUT',
        status: 'Upcoming',
        slots: '13/20',
        image: require('../../assets/images/ob3.png'),
        deadline: 'Oct 19',
        ctxh: '+2 volunteer hours',
        createdAt: '2025-09-15T08:30:00Z',
        type: 'Volunteer'
    }
];

export default function OrgActivityScreen() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState<'All' | 'Upcoming' | 'Ongoing' | 'Ended'>('All');
    const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest'>('newest');
    const [filterType, setFilterType] = React.useState<'All' | 'Volunteer' | 'Workshop'>('All');
    const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);

    // Counts (Dynamic)
    const upcomingCount = MY_ACTIVITIES.filter(a => a.status === 'Upcoming').length;
    const ongoingCount = MY_ACTIVITIES.filter(a => a.status === 'Ongoing').length;
    const endedCount = MY_ACTIVITIES.filter(a => a.status === 'Ended').length;

    const filteredActivities = React.useMemo(() => {
        let result = MY_ACTIVITIES;

        // 1. Filter by Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(lowerQuery) ||
                item.organizer.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Filter by Type
        if (filterType !== 'All') {
            result = result.filter(item => item.type === filterType);
        }

        // 3. Filter by Status
        if (statusFilter !== 'All') {
            result = result.filter(item => item.status === statusFilter);
        }

        // 4. Sort by Date Posted (createdAt)
        result = result.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [searchQuery, sortOrder, filterType, statusFilter]);

    const toggleSort = () => {
        setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
    };

    const selectFilter = (type: 'All' | 'Volunteer' | 'Workshop') => {
        setFilterType(type);
        setShowFilterDropdown(false);
    };

    const handleStatusClick = (status: 'Upcoming' | 'Ongoing' | 'Ended') => {
        setStatusFilter(prev => prev === status ? 'All' : status);
    };

    const renderActivityItem = ({ item }: { item: any }) => (
        <View style={styles.activityCard}>
            {/* Left Image Section */}
            <View style={styles.imageContainer}>
                <Image source={item.image} style={styles.activityImage} resizeMode="cover" />
            </View>

            {/* Right Content Section */}
            <View style={styles.contentContainer}>
                {/* Management Actions */}
                <View style={styles.topActionsRow}>
                    <TouchableOpacity style={[styles.actionButton, { borderColor: '#2196F3' }]}>
                        <Text style={[styles.actionButtonText, { color: '#2196F3' }]}>Update Activity</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, { borderColor: '#F44336' }]}>
                        <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Close activity</Text>
                    </TouchableOpacity>
                </View>

                {/* Title */}
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>

                {/* Organizer */}
                <View style={styles.organizerRow}>
                    <Ionicons name="people-outline" size={12} color="#666" />
                    <Text style={styles.organizerText}>{item.organizer}</Text>
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
                        <Text style={styles.detailText}>{item.location}</Text>
                    </View>
                    <View style={[styles.detailRow, { width: '50%', marginBottom: 4 }]}>
                        <Ionicons name="ellipse" size={8} color="#4CAF50" />
                        <Text style={styles.detailText}>{item.status}</Text>
                    </View>
                    <View style={[styles.detailRow, { width: '50%', marginBottom: 4 }]}>
                        <Ionicons name="ribbon-outline" size={12} color="#FF9800" />
                        <Text style={styles.detailText}>{item.ctxh}</Text>
                    </View>
                </View>

                {/* Deadline Warning */}
                {item.deadline && (
                    <Text style={styles.deadlineText}>🛡️ Deadline: {item.deadline}</Text>
                )}

                {/* Footer: Slot & Handle Request */}
                <View style={styles.cardFooter}>
                    <Text style={styles.slotText}>Slot: {item.slots}</Text>
                    <TouchableOpacity style={styles.handleRequestButton}>
                        <Text style={styles.handleRequestText}>Handle Request →</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.menuIcon}>
                        <Ionicons name="menu" size={28} color="#333" />
                    </TouchableOpacity>
                    <Image source={require('../../assets/images/logo_univolun.png')} style={styles.headerLogo} resizeMode="contain" />
                    <Image source={require('../../assets/images/student_image.png')} style={styles.avatar} />
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
                                    {['All', 'Volunteer', 'Workshop'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[styles.dropdownItem, filterType === type && styles.dropdownItemActive]}
                                            onPress={() => selectFilter(type as any)}
                                        >
                                            <Text style={[styles.dropdownText, filterType === type && styles.dropdownTextActive]}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Status Circles (Interactive) */}
                <View style={styles.statusContainer}>
                    {['Upcoming', 'Ongoing', 'Ended'].map((status) => (
                        <TouchableOpacity
                            key={status}
                            style={[styles.statusItem, { opacity: (statusFilter === 'All' || statusFilter === status) ? 1 : 0.3 }]}
                            onPress={() => handleStatusClick(status as any)}
                        >
                            <View style={[styles.circle,
                            {
                                borderColor: status === 'Upcoming' ? '#009688' : status === 'Ongoing' ? '#FF9800' : '#4CAF50',
                                backgroundColor: statusFilter === status ? (status === 'Upcoming' ? '#E0F2F1' : status === 'Ongoing' ? '#FFF3E0' : '#E8F5E9') : '#333'
                            }
                            ]}>
                                <Text style={[styles.statusCount, statusFilter === status && { color: status === 'Upcoming' ? '#009688' : status === 'Ongoing' ? '#FF9800' : '#4CAF50' }]}>
                                    {status === 'Upcoming' ? upcomingCount : status === 'Ongoing' ? ongoingCount : endedCount}
                                </Text>
                                <Text style={[styles.statusLabelSmall, statusFilter === status && { color: status === 'Upcoming' ? '#009688' : status === 'Ongoing' ? '#FF9800' : '#4CAF50' }]}>Events</Text>
                            </View>
                            <Text style={[styles.statusLabel, statusFilter === status && { color: status === 'Upcoming' ? '#009688' : status === 'Ongoing' ? '#FF9800' : '#4CAF50' }]}>{status.toUpperCase()}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Activity List */}
                <View style={styles.listContainer}>
                    <FlatList
                        data={filteredActivities}
                        renderItem={renderActivityItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                    />
                </View>

                {/* Create New Activity Button */}
                <TouchableOpacity style={styles.createActivityButton}>
                    <Text style={styles.createActivityText}>Create new activity</Text>
                    <Ionicons name="add-circle-outline" size={24} color="#fff" />
                </TouchableOpacity>

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
    menuIcon: { padding: 5 },
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
        // paddingLeft: 8,
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
        marginBottom: 40,
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
