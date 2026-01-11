import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from './context/AuthContext';

const { width } = Dimensions.get('window');

// API Interface matching schema
interface ActivityDetail {
    activityId: number;
    organizationName: string;
    imageUrl?: string;
    name: string; // Changed from title to name
    description: string;
    shortDescription: string;
    category: string;
    startDateTime: string;
    endDateTime: string;
    registrationDeadline: string; // Added field
    address: string;
    maxParticipants: number;
    numRegistrationCurrently: number;
    approvedParticipants: number;
    remainingSlots: number;
    registrationState: string;
    activityStatus: string;
    requirements: string;
    benefitsCtxh: number; // Volunteer Days
    createdAt: string;
}

export default function ActivityDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { token } = useAuth();

    // Get ID from params (supports 'id' or 'activityId')
    const activityId = params.id || params.activityId;

    const [activity, setActivity] = React.useState<ActivityDetail | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchActivityDetail = async () => {
            if (!activityId || !token) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`https://marg-astonishing-matthias.ngrok-free.dev/api/v1/activities/${activityId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const json = await response.json();

                if (json.success && json.data) {
                    setActivity(json.data);
                } else {
                    Alert.alert("Error", "Failed to load activity details.");
                }
            } catch (error) {
                console.error("Failed to fetch activity detail:", error);
                Alert.alert("Error", "Network error.");
            } finally {
                setLoading(false);
            }
        };

        fetchActivityDetail();
    }, [activityId, token]);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#FF4058" />
            </View>
        );
    }

    if (!activity) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Activity not found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#FF4058' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const formatFullDateTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const d = date.toLocaleDateString('en-GB'); // dd/mm/yyyy
            const t = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `${d}\n${t}`;
        } catch (e) { return "N/A"; }
    };

    const cleanUrl = activity.imageUrl ? activity.imageUrl.trim() : '';
    const imageSource = (cleanUrl.startsWith('http')) ? { uri: cleanUrl } : require('../assets/images/alternative.png');

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{activity.name}</Text>
                    {params.hideEdit !== 'true' ? (
                        <TouchableOpacity onPress={() => router.push({
                            pathname: '/update-activity',
                            params: {
                                id: activity.activityId,
                                title: activity.name,
                                description: activity.description,
                            }
                        })}>
                            <Text style={styles.editButtonText}>EDIT</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 40 }} />
                    )}
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Banner Image */}
                <View style={styles.imageContainer}>
                    <Image source={imageSource} style={styles.bannerImage} />
                    <View style={styles.organizerBadge}>
                        <Text style={styles.organizerText}>Organized by {activity.organizationName || 'Organization'}</Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>{activity.name}</Text>
                {activity.shortDescription ? (
                    <Text style={styles.shortDescription}>{activity.shortDescription}</Text>
                ) : null}

                {/* Tags */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>TAGS</Text>
                    <View style={styles.tagsRow}>
                        <View style={styles.tagItem}>
                            <View style={[styles.tagIcon, { backgroundColor: '#E0F7FA' }]}>
                                <Ionicons name="pricetag-outline" size={20} color="#00BCD4" />
                            </View>
                            <Text style={styles.tagText}>{activity.category.replace('_', ' ')}</Text>
                        </View>
                        <View style={styles.tagItem}>
                            <View style={[styles.tagIcon, {
                                backgroundColor: activity.registrationState === 'OPEN' ? '#E8F5E9' : '#FFEBEE'
                            }]}>
                                <Ionicons
                                    name={activity.registrationState === 'OPEN' ? "checkmark-circle-outline" : "close-circle-outline"}
                                    size={20}
                                    color={activity.registrationState === 'OPEN' ? "#4CAF50" : "#F44336"}
                                />
                            </View>
                            <Text style={styles.tagText}>{activity.registrationState}</Text>
                        </View>
                    </View>
                </View>

                {/* Info Grid */}
                <View style={styles.gridContainer}>
                    <View style={styles.gridRow}>

                        <View style={styles.gridItem}>
                            <View style={styles.gridHeader}>
                                <View style={[styles.gridIconContainer, { backgroundColor: '#E3F2FD' }]}>
                                    <Ionicons name="calendar-outline" size={18} color="#2196F3" />
                                </View>
                                <Text style={styles.gridLabel}>START</Text>
                            </View>
                            <Text style={styles.gridValue}>{formatFullDateTime(activity.startDateTime)}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <View style={styles.gridHeader}>
                                <View style={[styles.gridIconContainer, { backgroundColor: '#FFF3E0' }]}>
                                    <Ionicons name="calendar-outline" size={18} color="#FF9800" />
                                </View>
                                <Text style={styles.gridLabel}>END</Text>
                            </View>
                            <Text style={styles.gridValue}>{formatFullDateTime(activity.endDateTime)}</Text>
                        </View>
                    </View>

                    <View style={styles.gridRow}>
                        <View style={styles.gridItem}>
                            <View style={styles.gridHeader}>
                                <View style={[styles.gridIconContainer, { backgroundColor: '#FFEBEE' }]}>
                                    <Ionicons name="alarm-outline" size={18} color="#F44336" />
                                </View>
                                <Text style={styles.gridLabel}>DEADLINE</Text>
                            </View>
                            <Text style={styles.gridValue}>{formatFullDateTime(activity.registrationDeadline)}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <View style={styles.gridHeader}>
                                <View style={[styles.gridIconContainer, { backgroundColor: '#E0F2F1' }]}>
                                    <Ionicons name="people-outline" size={18} color="#009688" />
                                </View>
                                <Text style={styles.gridLabel}>SLOTS LEFT</Text>
                            </View>
                            <Text style={styles.gridValue}>{activity.remainingSlots}</Text>
                        </View>
                    </View>

                    <View style={styles.gridRow}>
                        <View style={[styles.gridItem, { width: width - 40 }]}>
                            <View style={styles.gridHeader}>
                                <View style={[styles.gridIconContainer, { backgroundColor: '#FFEBEE' }]}>
                                    <Ionicons name="location" size={18} color="#F44336" />
                                </View>
                                <Text style={styles.gridLabel}>LOCATION</Text>
                            </View>
                            <Text style={styles.gridValue} numberOfLines={2}>{activity.address}</Text>
                        </View>
                    </View>
                </View>

                {/* Participant Stats */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>PARTICIPANT STATISTICS</Text>
                    <View style={styles.statsContainer}>
                        <View style={styles.statsRow}>
                            <View style={styles.statsItem}>
                                <Text style={styles.statsLabel}>Max Registrations</Text>
                                <Text style={styles.statsValue}>{activity.maxParticipants * 3}</Text>
                            </View>
                            <View style={styles.statsItem}>
                                <Text style={styles.statsLabel}>Max Participants</Text>
                                <Text style={styles.statsValue}>{activity.maxParticipants}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statsRow}>
                            <View style={styles.statsItem}>
                                <Text style={styles.statsLabel}>Registered</Text>
                                <Text style={[styles.statsValue, { color: '#2196F3' }]}>{activity.numRegistrationCurrently || 0}</Text>
                            </View>
                            <View style={styles.statsItem}>
                                <Text style={styles.statsLabel}>Approved</Text>
                                <Text style={[styles.statsValue, { color: '#4CAF50' }]}>{activity.approvedParticipants}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>DETAILS</Text>
                    <View style={styles.detailsBox}>
                        <Text style={styles.detailsText}>{activity.description || "No description provided."}</Text>
                    </View>
                </View>

                {/* Requirements */}
                {
                    activity.requirements && (
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>REQUIREMENTS</Text>
                            <View style={styles.detailsBox}>
                                <Text style={styles.requirementItem}>{activity.requirements}</Text>
                            </View>
                        </View>
                    )
                }

                {/* Volunteer Days Card */}
                <View style={styles.volunteerCard}>
                    <View>
                        <Text style={styles.volunteerLabel}>Volunteer Days</Text>
                        <Text style={styles.volunteerValue}>{activity.benefitsCtxh || 0}</Text>
                    </View>
                    <View style={styles.volunteerIcon}>
                        <MaterialCommunityIcons name="clock-time-four-outline" size={40} color="#fff" />
                    </View>
                </View>
            </ScrollView >
        </View >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    headerSafeArea: { backgroundColor: '#fff', zIndex: 10 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    backButton: { padding: 5, backgroundColor: '#F5F5F5', borderRadius: 20 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', maxWidth: '60%' },
    editButtonText: { color: '#FF4058', fontWeight: 'bold', fontSize: 16 },

    scrollContent: { paddingBottom: 20 },

    // Banner
    imageContainer: { alignItems: 'center', marginTop: 15, marginBottom: 10 },
    bannerImage: { width: width - 40, height: 200, borderRadius: 20 },
    organizerBadge: { position: 'absolute', bottom: -10, backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    organizerText: { fontWeight: 'bold', color: '#333' },

    section: { paddingHorizontal: 20, marginTop: 25 },
    sectionLabel: { fontSize: 13, color: '#999', marginBottom: 10, letterSpacing: 1 },

    // Tags
    tagsRow: { flexDirection: 'row' },
    tagItem: { alignItems: 'center', marginRight: 20 },
    tagIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
    tagText: { fontSize: 12, color: '#666' },

    // Grid
    gridContainer: { paddingHorizontal: 20, marginTop: 25 },
    gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 0 },
    gridItem: {
        width: (width - 48) / 2,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 15,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
        borderWidth: 1, borderColor: '#f0f0f0'
    },
    gridHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    gridIconContainer: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    gridLabel: { fontSize: 11, color: '#999', fontWeight: '700', letterSpacing: 0.5 },
    gridValue: { fontSize: 13, fontWeight: 'bold', color: '#333', lineHeight: 20 },

    // Details Box
    detailsBox: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 15, backgroundColor: '#FAFAFA' },
    detailsText: { fontSize: 14, color: '#333', lineHeight: 22 },
    requirementItem: { fontSize: 14, color: '#333', lineHeight: 24 },

    // Volunteer Card
    volunteerCard: {
        marginHorizontal: 20,
        marginTop: 30,
        backgroundColor: '#FF4058',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#FF4058', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
    },
    volunteerLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '600' },
    volunteerValue: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
    volunteerIcon: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 25 },

    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
        marginHorizontal: 20,
        marginTop: 25,
    },
    shortDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginHorizontal: 20,
        marginTop: 8,
        lineHeight: 22,
    },
    statsContainer: {
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#eee',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    statsItem: {
        flex: 1,
    },
    statsLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    statsValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 10,
    }
});
