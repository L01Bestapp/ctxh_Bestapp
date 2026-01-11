import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Organization {
    organizationId: number;
    userId?: number; // Check if this exists
    organizationName: string;
    email: string;
    representativePhoneNumber: string;
    status?: string;
}

interface Student {
    studentId: number;
    userId?: number; // Check if this exists
    fullName: string;
    email: string;
    mssv: string;
    phoneNumber: string;
    faculty: string;
    avatarUrl?: string;
    status: string; // Assuming status exists or we track it
}

interface HistoryItem {
    id: string;
    action: 'ACTIVATE' | 'BAN' | 'UNBAN';
    targetName: string;
    targetType: 'Organization' | 'Student';
    timestamp: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const { token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'requests' | 'organizations' | 'students' | 'history'>('requests');

    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadData = () => {
        if (activeTab === 'students') {
            fetchStudents();
        } else if (activeTab === 'organizations' || activeTab === 'requests') {
            fetchOrganizations();
        }
    };

    const loadHistory = async () => {
        try {
            const storedHistory = await AsyncStorage.getItem('adminActionHistory');
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Failed to load history", error);
        }
    };

    const addToHistory = async (action: HistoryItem['action'], targetName: string, targetType: HistoryItem['targetType']) => {
        const newItem: HistoryItem = {
            id: Date.now().toString(),
            action,
            targetName,
            targetType,
            timestamp: new Date().toISOString()
        };
        const updatedHistory = [newItem, ...history];
        setHistory(updatedHistory);
        await AsyncStorage.setItem('adminActionHistory', JSON.stringify(updatedHistory));
    };

    const fetchOrganizations = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('https://marg-astonishing-matthias.ngrok-free.dev/api/v1/organization', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const json = await response.json();
            if (json.success && Array.isArray(json.data)) {
                setOrganizations(json.data);
            } else {
                setOrganizations([]);
            }
        } catch (error) {
            console.error("Fetch Orgs Error:", error);
            Alert.alert("Error", "Failed to fetch organizations.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('https://marg-astonishing-matthias.ngrok-free.dev/api/v1/students', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const json = await response.json();
            if (json.success && Array.isArray(json.data)) {
                setStudents(json.data);
            } else {
                setStudents([]);
            }
        } catch (error) {
            console.error("Fetch Students Error:", error);
            Alert.alert("Error", "Failed to fetch students.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleActivateOrg = async (id: number, name: string) => {
        setProcessingId(id);
        try {
            const response = await fetch(`https://marg-astonishing-matthias.ngrok-free.dev/api/v1/organization/${id}/active`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            const json = await response.json();
            if (json.success) {
                Alert.alert("Success", "Organization activated successfully!");
                addToHistory('ACTIVATE', name, 'Organization');
                loadData();
            } else {
                Alert.alert("Error", json.message || "Activation failed.");
            }
        } catch (error) {
            console.error("Activate Error:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleBanUser = async (userId: number, name: string, type: 'Organization' | 'Student') => {
        if (!userId) {
            Alert.alert("Error", "User ID not found for this item.");
            return;
        }

        setProcessingId(userId);
        try {
            const response = await fetch(`https://marg-astonishing-matthias.ngrok-free.dev/api/v1/auth/ban-user?userId=${userId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const json = await response.json();
            if (response.ok && json.success) {
                Alert.alert("Success", "User has been banned.");
                addToHistory('BAN', name, type);
                loadData();
            } else {
                Alert.alert("Error", json.message || "Failed to ban user.");
            }
        } catch (error) {
            console.error("Ban Error:", error);
            Alert.alert("Error", "Network error.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleUnbanUser = async (userId: number, name: string, type: 'Organization' | 'Student') => {
        if (!userId) {
            Alert.alert("Error", "User ID not found for this item.");
            return;
        }

        setProcessingId(userId);
        try {
            const response = await fetch(`https://marg-astonishing-matthias.ngrok-free.dev/api/v1/auth/un-ban-user?userId=${userId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const json = await response.json();
            if (response.ok && json.success) {
                Alert.alert("Success", "User has been unbanned.");
                addToHistory('UNBAN', name, type);
                loadData();
            } else {
                Alert.alert("Error", json.message || "Failed to unban user.");
            }
        } catch (error) {
            console.error("Unban Error:", error);
            Alert.alert("Error", "Network error.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleLogout = () => {
        logout();
        router.replace('/login');
    };

    // Filter data
    // User clarified that GET /api/v1/organization returns already active organizations.
    // So distinct filtering might not be needed for 'Active' tab.
    // pendingOrgs will likely be empty if the API strictly returns active ones.
    const pendingOrgs = organizations.filter(o => o.status === 'PENDING');
    const activeOrgs = organizations; // Show all fetched organizations in the 'Orgs' tab

    const renderOrgItem = ({ item }: { item: Organization }) => {
        const userId = item.userId || item.organizationId;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.name}>{item.organizationName}</Text>
                    {item.status && (
                        <View style={[styles.badge, item.status === 'ACTIVE' ? styles.badgeActive : styles.badgeInactive]}>
                            <Text style={styles.badgeText}>{item.status || 'PENDING'}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.info}>Email: {item.email}</Text>
                <Text style={styles.info}>Phone: {item.representativePhoneNumber}</Text>

                <View style={styles.actionRow}>
                    {/* Show Activate only in Requests tab */}
                    {activeTab === 'requests' && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.activateBtn]}
                            onPress={() => handleActivateOrg(item.organizationId, item.organizationName)}
                            disabled={!!processingId}
                        >
                            <Text style={styles.btnText}>Activate</Text>
                        </TouchableOpacity>
                    )}

                    {/* Show Ban/Unban only in Organizations tab */}
                    {activeTab === 'organizations' && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.banBtn]}
                                onPress={() => handleBanUser(userId, item.organizationName, 'Organization')}
                                disabled={!!processingId}
                            >
                                <Text style={styles.btnText}>Ban</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.unbanBtn]}
                                onPress={() => handleUnbanUser(userId, item.organizationName, 'Organization')}
                                disabled={!!processingId}
                            >
                                <Text style={styles.btnText}>Unban</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        );
    };

    const renderStudentItem = ({ item }: { item: Student }) => {
        const userId = item.userId || item.studentId;
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.name}>{item.fullName}</Text>
                    <Text style={styles.subInfo}>{item.mssv}</Text>
                </View>
                <Text style={styles.info}>Email: {item.email}</Text>
                <Text style={styles.info}>Faculty: {item.faculty}</Text>
                <Text style={styles.info}>Phone: {item.phoneNumber}</Text>

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.banBtn]}
                        onPress={() => handleBanUser(userId, item.fullName, 'Student')}
                        disabled={!!processingId}
                    >
                        <Text style={styles.btnText}>Ban</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.unbanBtn]}
                        onPress={() => handleUnbanUser(userId, item.fullName, 'Student')}
                        disabled={!!processingId}
                    >
                        <Text style={styles.btnText}>Unban</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
        <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
                <Text style={[styles.historyAction,
                item.action === 'ACTIVATE' ? styles.textBlue :
                    item.action === 'BAN' ? styles.textRed : styles.textGreen
                ]}>
                    {item.action}
                </Text>
                <Text style={styles.historyTime}>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
            <Text style={styles.historyTarget}>
                {item.targetType}: <Text style={{ fontWeight: 'bold' }}>{item.targetName}</Text>
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin Dashboard</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
                    onPress={() => setActiveTab('requests')}
                >
                    <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>Requests</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'organizations' && styles.activeTab]}
                    onPress={() => setActiveTab('organizations')}
                >
                    <Text style={[styles.tabText, activeTab === 'organizations' && styles.activeTabText]}>Orgs</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'students' && styles.activeTab]}
                    onPress={() => setActiveTab('students')}
                >
                    <Text style={[styles.tabText, activeTab === 'students' && styles.activeTabText]}>Students</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                    onPress={() => setActiveTab('history')}
                >
                    <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
                </TouchableOpacity>
            </View>

            {isLoading && activeTab !== 'history' ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#FF4058" />
                </View>
            ) : (
                <>
                    {activeTab === 'requests' ? (
                        <FlatList
                            data={pendingOrgs}
                            keyExtractor={(item) => item.organizationId.toString()}
                            renderItem={renderOrgItem}
                            contentContainerStyle={styles.list}
                            ListEmptyComponent={<Text style={styles.emptyText}>No pending requests.</Text>}
                        />
                    ) : activeTab === 'organizations' ? (
                        <FlatList
                            data={activeOrgs}
                            keyExtractor={(item) => item.organizationId.toString()}
                            renderItem={renderOrgItem}
                            contentContainerStyle={styles.list}
                            ListEmptyComponent={<Text style={styles.emptyText}>No active organizations.</Text>}
                        />
                    ) : activeTab === 'students' ? (
                        <FlatList
                            data={students}
                            keyExtractor={(item) => item.studentId.toString()}
                            renderItem={renderStudentItem}
                            contentContainerStyle={styles.list}
                            ListEmptyComponent={<Text style={styles.emptyText}>No students found.</Text>}
                        />
                    ) : (
                        <FlatList
                            data={history}
                            keyExtractor={(item) => item.id}
                            renderItem={renderHistoryItem}
                            contentContainerStyle={styles.list}
                            ListEmptyComponent={<Text style={styles.emptyText}>No history recorded.</Text>}
                        />
                    )}
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 5,
        marginBottom: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#FF4058',
    },
    tabText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#FF4058',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 15,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    subInfo: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
    },
    info: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeActive: {
        backgroundColor: '#E8F5E9',
    },
    badgeInactive: {
        backgroundColor: '#FFEBEE',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 10,
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
    },
    activateBtn: {
        backgroundColor: '#2196F3',
    },
    banBtn: {
        backgroundColor: '#FF4058',
    },
    unbanBtn: {
        backgroundColor: '#4CAF50',
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
    },
    // History Styles
    historyCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#ccc',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    historyAction: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    historyTime: {
        fontSize: 12,
        color: '#999',
    },
    historyTarget: {
        fontSize: 14,
        color: '#555',
    },
    textRed: { color: '#E53935' },
    textGreen: { color: '#43A047' },
    textBlue: { color: '#1E88E5' },
});
