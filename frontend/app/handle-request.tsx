import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './context/AuthContext';

interface Enrollment {
    enrollmentId: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    appliedAt: string;        // ISO datetime
    approvedAt: string | null;
    approvedBy: number | null;
    rejectedAt: string | null;
    rejectedBy: number | null;
    isCompleted: boolean;
    completedAt: string | null;
    studentId: number;
    fullName: string;
    mssv: string;
    email: string;
    phoneNumber: string;
    academicYear: string | null;
    faculty: string | null;
    gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
    dateOfBirth: string | null; // ISO date
    totalCtxhDays: number;
}


export default function HandleRequestScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { token, user } = useAuth();
    const activityId = params.activityId;

    // State
    const [activeTab, setActiveTab] = useState<'review' | 'history'>('review');
    const [requests, setRequests] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    // Parse initial slots from params as fallback
    const initialSlots = (params.slots as string || '0/0').split('/').map(Number);

    // State for activity stats (fetched from API)
    const [stats, setStats] = useState({
        approved: initialSlots[0] || 0,
        max: initialSlots[1] || 0
    });

    React.useEffect(() => {
        fetchActivityDetail();
        fetchEnrollments();
    }, [activityId, token]);

    const fetchActivityDetail = async () => {
        if (!activityId || !token) return;
        try {
            const response = await fetch(`https://marg-astonishing-matthias.ngrok-free.dev/api/v1/activities/${activityId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const json = await response.json();
            if (json.success && json.data) {
                setStats({
                    approved: json.data.approvedParticipants,
                    max: json.data.maxParticipants
                });
            }
        } catch (error) {
            console.error("Fetch Activity Stats Error:", error);
        }
    };

    const fetchEnrollments = async () => {
        if (!activityId || !token) return;
        try {
            setLoading(true);
            const response = await fetch(`https://marg-astonishing-matthias.ngrok-free.dev/api/v1/activities/${activityId}/enrollments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const json = await response.json();
            if (json.success && Array.isArray(json.data)) {
                setRequests(json.data);
            }
        } catch (error) {
            console.error("Fetch Enrollments Error:", error);
            Alert.alert("Error", "Failed to load enrollments");
        } finally {
            setLoading(false);
        }
    };

    const [filterCohort, setFilterCohort] = useState<string | null>(null);

    // ... (existing code for stats state and fetch effects)

    const formatDateTime = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // DD/MM/YYYY HH:mm
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    // Filter Data based on Tab, Search, Sort, and Cohort
    const displayData = useMemo(() => {
        // 1. Filter by Tab
        let filtered = requests.filter(req => {
            if (activeTab === 'review') return req.status === 'PENDING';
            return req.status === 'APPROVED' || req.status === 'REJECTED';
        });

        // 2. Filter by Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(req =>
                req.fullName.toLowerCase().includes(query) ||
                req.mssv.includes(query) ||
                req.email.toLowerCase().includes(query)
            );
        }

        // 3. Filter by Cohort (K21, K22, etc.)
        if (filterCohort && filterCohort !== 'All') {
            // "K22" -> prefix "22"
            const prefix = filterCohort.replace('K', '');
            filtered = filtered.filter(req => req.mssv.startsWith(prefix));
        }

        // 4. Sort
        filtered.sort((a, b) => {
            const timeA = new Date(a.appliedAt).getTime();
            const timeB = new Date(b.appliedAt).getTime();
            return sortOrder === 'newest'
                ? timeB - timeA
                : timeA - timeB;
        });

        return filtered;
    }, [requests, activeTab, searchQuery, sortOrder, filterCohort]);

    // Handlers
    const updateStatus = (id: number, newStatus: 'APPROVED' | 'REJECTED') => {
        setRequests(prev => prev.map(req =>
            req.enrollmentId === id ? { ...req, status: newStatus } : req
        ));
    };

    const handleAccept = async (id: number, name: string) => {
        Alert.alert("Confirm Acceptance", `Accept ${name}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Accept",
                onPress: async () => {
                    if (!user?.id) {
                        Alert.alert("Error", "User info not found");
                        return;
                    }
                    try {
                        const url = `https://marg-astonishing-matthias.ngrok-free.dev/api/v1/activities/${activityId}/enrollments/${id}/approve?approvedBy=${user.id}`;
                        const response = await fetch(url, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        const json = await response.json();

                        if (response.ok && (json.success || json.code === 0)) {
                            updateStatus(id, 'APPROVED');
                            fetchActivityDetail(); // Refresh slot count from server
                            Alert.alert("Success", `${name} has been accepted`);
                        } else {
                            Alert.alert("Error", json.message || "Failed to accept");
                        }
                    } catch (error) {
                        console.error("Accept Error:", error);
                        Alert.alert("Error", "Failed to accept enrollment");
                    }
                }
            }
        ]);
    };

    const handleReject = (id: number, name: string) => {
        Alert.alert("Confirm Rejection", `Reject ${name}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Reject",
                style: 'destructive',
                onPress: async () => {
                    if (!user?.id) {
                        Alert.alert("Error", "User info not found");
                        return;
                    }
                    try {
                        const url = `https://marg-astonishing-matthias.ngrok-free.dev/api/v1/activities/${activityId}/enrollments/${id}/reject?rejectedBy=${user.id}`;
                        const response = await fetch(url, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        const json = await response.json();

                        if (response.ok && (json.success || json.code === 0)) {
                            updateStatus(id, 'REJECTED');
                            fetchActivityDetail(); // Refresh stats
                            Alert.alert("Success", `${name} has been rejected`);
                        } else {
                            Alert.alert("Error", json.message || "Failed to reject");
                        }
                    } catch (error) {
                        console.error("Reject Error:", error);
                        Alert.alert("Error", "Failed to reject enrollment");
                    }
                }
            }
        ]);
    };

    const handleFilterPress = () => {
        const currentYear = new Date().getFullYear();
        // Generate cohorts: from (Year - 6) to (Year - 1)
        // e.g. 2026 -> 2020 (K20) to 2025 (K25)
        const cohorts = Array.from({ length: 6 }, (_, i) => {
            const year = currentYear - 6 + i;
            return `K${year % 100}`;
        });

        const options = [
            { text: "All", onPress: () => setFilterCohort(null) },
            ...cohorts.map(k => ({ text: k, onPress: () => setFilterCohort(k) })),
            { text: "Cancel", style: "cancel" }
        ];

        Alert.alert(
            "Filter by Cohort",
            "Select a cohort to filter by:",
            options as any, // Type assertion to satisfy Alert static method if needed, though strictly it fits AlertButton
            { cancelable: true }
        );
    };

    // Render Items
    const renderItem = ({ item, index }: { item: Enrollment, index: number }) => {
        const studentAvatar = require('../assets/images/student_image.png');

        if (activeTab === 'review') {
            return (
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <View style={styles.indexBadge}>
                            <Text style={styles.indexText}>#{index + 1}</Text>
                        </View>
                        <Text style={styles.timestamp}>Applied: {formatDateTime(item.appliedAt)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.cardContent}>
                        <Image source={studentAvatar} style={styles.avatar} />
                        <View style={styles.textContainer}>
                            <Text style={styles.name}>{item.fullName}</Text>
                            <Text style={styles.studentId}>ID: {item.mssv}</Text>
                            <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                            {item.faculty ? <Text style={styles.email}>{item.faculty}</Text> : null}
                        </View>
                    </View>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={() => handleReject(item.enrollmentId, item.fullName)}>
                            <Text style={styles.rejectText}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={() => handleAccept(item.enrollmentId, item.fullName)}>
                            <Text style={styles.acceptText}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } else {
            // History
            return (
                <View style={styles.historyCard}>
                    <Text style={styles.historyIndex}>#{index + 1}</Text>
                    <Image source={studentAvatar} style={styles.historyAvatar} />
                    <View style={styles.historyInfo}>
                        <Text style={styles.historyName}>{item.fullName}</Text>
                        <Text style={styles.historyEmail}>{item.email}</Text>
                        <Text style={[styles.historyEmail, { fontSize: 10 }]}>{formatDateTime(item.appliedAt)}</Text>
                    </View>
                    <View style={styles.historyRight}>
                        <Text style={styles.historyId}>{item.mssv}</Text>
                        <View style={[
                            styles.statusBadgeSmall,
                            item.status === 'APPROVED' ? styles.badgeApproved : styles.badgeRejected
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
            {/* Header ... */}
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

            {/* Tabs ... */}
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

            <View style={styles.contentContainer}>
                <Text style={styles.sectionTitle}>MEMBER OF ACTIVITY</Text>

                {/* Search & Sort Only (Filter Removed) */}
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
                        <Text style={styles.filterBtnText}>Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}</Text>
                        <Ionicons name="swap-vertical" size={12} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterButton, { marginLeft: 8 }]} onPress={handleFilterPress}>
                        <Text style={styles.filterBtnText}>
                            Filter: {filterCohort || 'All'}
                        </Text>
                        <Ionicons name="filter" size={12} color="#333" />
                    </TouchableOpacity>
                </View>

                <View style={styles.totalRow}>
                    <Text style={styles.totalText}>Slots: <Text style={{ color: '#4CAF50' }}>{stats.approved}/{stats.max}</Text></Text>
                    <Text style={styles.totalText}>Total: <Text style={{ color: '#FF4058' }}>{displayData.length}</Text></Text>
                </View>
            </View>

            {/* List */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#FF4058" />
                </View>
            ) : (
                <FlatList
                    data={displayData}
                    renderItem={renderItem}
                    keyExtractor={item => item.enrollmentId.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No members found</Text>
                        </View>
                    }
                />
            )}
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
