import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Types
type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

interface RequestItem {
    id: string;
    name: string;
    studentId: string;
    email: string;
    avatar: any;
    status: RequestStatus;
    appliedTime: string; // Display string
    timestamp: number;   // For sorting
}

// Mock Data
const INITIAL_REQUESTS: RequestItem[] = [
    {
        id: '1', name: 'Nguyen Van A', studentId: '2111001', email: 'van.nguyen21@hcmut.edu.vn',
        avatar: require('../assets/images/student_image.png'), status: 'Pending', appliedTime: '2 hours ago', timestamp: Date.now() - 7200000
    },
    {
        id: '2', name: 'Tran Thi B', studentId: '2111002', email: 'thi.tran21@hcmut.edu.vn',
        avatar: require('../assets/images/student_image.png'), status: 'Pending', appliedTime: '5 hours ago', timestamp: Date.now() - 18000000
    },
    {
        id: '3', name: 'Le Van C', studentId: '2111003', email: 'van.le21@hcmut.edu.vn',
        avatar: require('../assets/images/student_image.png'), status: 'Pending', appliedTime: '1 day ago', timestamp: Date.now() - 86400000
    },
    // Mock History Items
    {
        id: '4', name: 'Nguyen Thi An', studentId: '2212023', email: 'annguyen@hcmut.edu.vn',
        avatar: require('../assets/images/student_image.png'), status: 'Approved', appliedTime: '2 days ago', timestamp: Date.now() - 172800000
    },
    {
        id: '5', name: 'Nguyen Van Binh', studentId: '2314321', email: 'vanbinh@hcmut.edu.vn',
        avatar: require('../assets/images/student_image.png'), status: 'Rejected', appliedTime: '3 days ago', timestamp: Date.now() - 259200000
    },
];

export default function HandleRequestScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // State
    const [activeTab, setActiveTab] = useState<'review' | 'history'>('review');
    const [requests, setRequests] = useState<RequestItem[]>(INITIAL_REQUESTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    // Filter Data based on Tab, Search, and Sort
    const displayData = useMemo(() => {
        // 1. Filter by Tab
        let filtered = requests.filter(req => {
            if (activeTab === 'review') return req.status === 'Pending';
            return req.status === 'Approved' || req.status === 'Rejected';
        });

        // 2. Filter by Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(req =>
                req.name.toLowerCase().includes(query) ||
                req.studentId.includes(query) ||
                req.email.toLowerCase().includes(query)
            );
        }

        // 3. Sort
        filtered.sort((a, b) => {
            return sortOrder === 'newest'
                ? b.timestamp - a.timestamp
                : a.timestamp - b.timestamp;
        });

        return filtered;
    }, [requests, activeTab, searchQuery, sortOrder]);

    // Handlers
    const updateStatus = (id: string, newStatus: RequestStatus) => {
        setRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: newStatus } : req
        ));
    };

    const handleAccept = (id: string, name: string) => {
        Alert.alert("Confirm Acceptance", `Accept ${name}?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Accept", onPress: () => updateStatus(id, 'Approved') }
        ]);
    };

    const handleReject = (id: string, name: string) => {
        Alert.alert("Confirm Rejection", `Reject ${name}?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Reject", style: 'destructive', onPress: () => updateStatus(id, 'Rejected') }
        ]);
    };

    // Render Items
    const renderItem = ({ item, index }: { item: RequestItem, index: number }) => {
        if (activeTab === 'review') {
            // Under Review Item (Pending)
            return (
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <View style={styles.indexBadge}>
                            <Text style={styles.indexText}>#{index + 1}</Text>
                        </View>
                        <Text style={styles.timestamp}>Applied: {item.appliedTime}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.cardContent}>
                        <Image source={item.avatar} style={styles.avatar} />
                        <View style={styles.textContainer}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.studentId}>ID: {item.studentId}</Text>
                            <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                        </View>
                    </View>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={() => handleReject(item.id, item.name)}>
                            <Text style={styles.rejectText}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={() => handleAccept(item.id, item.name)}>
                            <Text style={styles.acceptText}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } else {
            // History Item (Approved/Rejected)
            return (
                <View style={styles.historyCard}>
                    <Text style={styles.historyIndex}>#{index + 1}</Text>
                    <Image source={item.avatar} style={styles.historyAvatar} />
                    <View style={styles.historyInfo}>
                        <Text style={styles.historyName}>{item.name}</Text>
                        <Text style={styles.historyEmail}>{item.email}</Text>
                    </View>
                    <View style={styles.historyRight}>
                        <Text style={styles.historyId}>{item.studentId}</Text>
                        <View style={[
                            styles.statusBadgeSmall,
                            item.status === 'Approved' ? styles.badgeApproved : styles.badgeRejected
                        ]}>
                            <Text style={styles.statusTextSmall}>{item.status}</Text>
                        </View>
                    </View>
                </View>
            );
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {params.title || "Handle Request"}
                </Text>
                <TouchableOpacity style={styles.headerMore}>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'review' && styles.activeTab]}
                    onPress={() => setActiveTab('review')}
                >
                    <Text style={[styles.tabText, activeTab === 'review' && styles.activeTabText]}>Under Review</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                    onPress={() => setActiveTab('history')}
                >
                    <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History / Status</Text>
                </TouchableOpacity>
            </View>

            {/* Content Header (Member of Activity & Search) */}
            <View style={styles.contentContainer}>
                <Text style={styles.sectionTitle}>MEMBER OF ACTIVITY</Text>

                {/* Search & Sort */}
                <View style={styles.searchRow}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={18} color="#999" />
                        <TextInput
                            style={styles.input}
                            placeholder="Search any member..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <Ionicons name="mic-outline" size={18} color="#999" />
                    </View>
                </View>

                <View style={styles.filterRow}>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={styles.filterButton} onPress={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}>
                        <Text style={styles.filterBtnText}>Sort</Text>
                        <Ionicons name="swap-vertical" size={12} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterButton, { marginLeft: 8 }]}>
                        <Text style={styles.filterBtnText}>Filter</Text>
                        <Ionicons name="filter" size={12} color="#333" />
                    </TouchableOpacity>
                </View>

                <View style={styles.totalRow}>
                    <Text style={styles.totalText}>Slots: <Text style={{ color: '#4CAF50' }}>{params.slots || '--/--'}</Text></Text>
                    <Text style={styles.totalText}>Total: <Text style={{ color: '#FF4058' }}>{displayData.length}</Text></Text>
                </View>
            </View>

            {/* List */}
            <FlatList
                data={displayData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No members found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 15, paddingVertical: 10,
    },
    backButton: { padding: 5, backgroundColor: '#F5F5F5', borderRadius: 20 },
    headerTitle: { fontSize: 16, fontWeight: 'bold', maxWidth: '70%' },
    headerMore: { padding: 5, backgroundColor: '#F5F5F5', borderRadius: 20 },

    // Tabs
    tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
    tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
    activeTab: { borderBottomWidth: 2, borderBottomColor: '#FF4058' },
    tabText: { fontSize: 15, color: '#999', fontWeight: 'bold' },
    activeTabText: { color: '#FF4058' },

    // Content Section
    contentContainer: { padding: 20, paddingBottom: 5 },
    sectionTitle: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase' },

    searchRow: { marginBottom: 10 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA',
        borderRadius: 8, paddingHorizontal: 10, height: 45, borderWidth: 1, borderColor: '#f0f0f0'
    },
    input: { flex: 1, marginLeft: 10, fontSize: 14 },

    filterRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 },
    filterButton: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderWidth: 1, borderColor: '#eee', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5
    },
    filterBtnText: { fontSize: 12, marginRight: 4, fontWeight: '600' },

    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    totalText: { fontSize: 12, fontWeight: 'bold', color: '#333' },

    list: { paddingHorizontal: 20, paddingBottom: 20 },

    // Pending Card Styles
    card: {
        backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15,
        borderWidth: 1, borderColor: '#eee',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    indexBadge: { backgroundColor: '#f0f0f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    indexText: { fontSize: 10, fontWeight: 'bold', color: '#666' },
    timestamp: { fontSize: 11, color: '#999' },
    divider: { height: 1, backgroundColor: '#f5f5f5', marginBottom: 10 },
    cardContent: { flexDirection: 'row', marginBottom: 15 },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
    textContainer: { flex: 1, justifyContent: 'center' },
    name: { fontSize: 15, fontWeight: 'bold', color: '#000' },
    studentId: { fontSize: 13, color: '#666' },
    email: { fontSize: 12, color: '#888', marginTop: 2 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    button: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    rejectButton: { backgroundColor: '#FFEBEE' },
    rejectText: { color: '#F44336', fontWeight: 'bold', fontSize: 13 },
    acceptButton: { backgroundColor: '#E8F5E9' },
    acceptText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 13 },

    // History Card Styles
    historyCard: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#f9f9f9', marginBottom: 5
    },
    historyIndex: { width: 25, fontSize: 13, color: '#888', fontWeight: '600' },
    historyAvatar: { width: 44, height: 44, borderRadius: 10, marginRight: 12, backgroundColor: '#eee' }, // Square-ish radius per image
    historyInfo: { flex: 1 },
    historyName: { fontSize: 14, fontWeight: 'bold', color: '#000' },
    historyEmail: { fontSize: 12, color: '#666' },
    historyRight: { alignItems: 'flex-end' },
    historyId: { fontSize: 12, color: '#999', textDecorationLine: 'underline', marginBottom: 4 },
    statusBadgeSmall: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
    badgeApproved: { backgroundColor: '#80CBC4' },
    badgeRejected: { backgroundColor: '#FF5252' },
    statusTextSmall: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
    // Image actually shows dark text on light badge. Let's fix colors.

    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#aaa', fontSize: 14 }
});
