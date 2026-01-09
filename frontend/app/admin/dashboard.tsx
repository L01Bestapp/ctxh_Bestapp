import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface Organization {
    organizationId: number;
    organizationName: string;
    email: string;
    representativePhoneNumber: string;
    address?: string;
    status?: string; // Optional as it's not in the provided schema example
}

export default function AdminDashboard() {
    const router = useRouter();
    const { token, logout } = useAuth();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activatingId, setActivatingId] = useState<number | null>(null);

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const response = await fetch('https://marg-astonishing-matthias.ngrok-free.dev/api/v1/organization', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const json = await response.json();
            // console.log("Admin Org List:", json);

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

    const handleActivate = async (id: number) => {
        setActivatingId(id);
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
                fetchOrganizations();
            } else {
                Alert.alert("Error", json.message || "Activation failed.");
            }
        } catch (error) {
            console.error("Activate Error:", error);
            Alert.alert("Error", "Network error during activation.");
        } finally {
            setActivatingId(null);
        }
    };

    const handleLogout = () => {
        logout();
        router.replace('/login');
    };

    const renderItem = ({ item }: { item: Organization }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.orgName}>{item.organizationName}</Text>
                {/* Status is not in schema, assuming list implies pending/all. 
                    If status exists in real data, it will show, otherwise 'UNKNOWN' or similar. 
                    For now, forcing the button to show. */}
                {item.status && (
                    <View style={[styles.badge, item.status === 'ACTIVE' ? styles.badgeActive : styles.badgeInactive]}>
                        <Text style={styles.badgeText}>{item.status}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.info}>ID: {item.organizationId}</Text>
            <Text style={styles.info}>Email: {item.email}</Text>
            <Text style={styles.info}>Phone: {item.representativePhoneNumber}</Text>

            <TouchableOpacity
                style={[styles.activateButton, activatingId === item.organizationId && styles.disabledButton]}
                onPress={() => handleActivate(item.organizationId)}
                disabled={activatingId === item.organizationId}
            >
                {activatingId === item.organizationId ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={styles.activateButtonText}>Activate Account</Text>
                )}
            </TouchableOpacity>
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

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#FF4058" />
                </View>
            ) : (
                <FlatList
                    data={organizations}
                    keyExtractor={(item) => item.organizationId.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>No organizations found.</Text>}
                />
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
    orgName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
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
    activateButton: {
        backgroundColor: '#FF4058',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#FF8A9D',
    },
    activateButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
    },
});
