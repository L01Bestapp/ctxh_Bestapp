import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

// API Interface matching schema
interface ActivityDetail {
    activityId: number;
    organizationName: string;
    imageUrl?: string;
    name: string; // Changed from title to name based on API response
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

export const formatFullDateTime = (dateString: string) => {
    try {
        const date = new Date(dateString);
        const d = date.toLocaleDateString('en-GB'); // dd/mm/yyyy
        const t = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${d} ${t}`;
    } catch (e) { return "N/A"; }
};

export default function StudentActivityDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { token } = useAuth();
    const insets = useSafeAreaInsets();

    // Get ID from params (could be passed as id or activityId)
    const activityId = params.id || params.activityId;

    const [activity, setActivity] = React.useState<ActivityDetail | null>(null);
    const [loading, setLoading] = React.useState(true);

    const [enrollmentStatus, setEnrollmentStatus] = React.useState<string>(
        (Array.isArray(params.enrollmentStatus)
            ? params.enrollmentStatus[0]
            : params.enrollmentStatus) || ''
    );

    // Countdown State
    const [timeLeft, setTimeLeft] = React.useState('');

    React.useEffect(() => {
        if (!activity?.registrationDeadline) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const deadline = new Date(activity.registrationDeadline).getTime();
            const distance = deadline - now;

            if (distance < 0) {
                setTimeLeft('Expired');
                clearInterval(timer);
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

                let timeString = '';
                if (days > 0) timeString += `${days} days `;
                if (hours > 0) timeString += `${hours} hr `;
                timeString += `${minutes} min left`;
                setTimeLeft(timeString);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [activity]);

    React.useEffect(() => {
        const fetchActivityDetail = async () => {
            if (!activityId || !token) {
                setLoading(false);
                return;
            }

            try {
                // console.log(`Fetching activity detail for ID: ${activityId}`);
                const response = await fetch(`https://marg-astonishing-matthias.ngrok-free.dev/api/v1/activities/${activityId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const json = await response.json();

                if (json.success && json.data) {

                    setActivity(json.data);

                    // Check for potential registration fields
                    if (json.data.isRegistered || json.data.isEnrolled || json.data.enrollmentStatus) {
                        setIsRegistered(true);
                        // Only overwrite if the API explicitly returns a status
                        if (json.data.enrollmentStatus) {
                            setEnrollmentStatus(json.data.enrollmentStatus);
                        }
                    }
                } else {
                    Alert.alert("Error", "Failed to load activity details.");
                }


            } catch (error) {
                // console.error("Failed to fetch activity detail:", error);
                Alert.alert("Error", "Network error. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchActivityDetail();
    }, [activityId, token]);

    const [isRegistered, setIsRegistered] = React.useState(params.isRegistered === 'true');

    const handleRegister = async () => {
        if (!activity || !token) return;

        try {
            const response = await fetch('https://marg-astonishing-matthias.ngrok-free.dev/api/v1/enrollments', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    activityId: activity.activityId
                })
            });
            const json = await response.json();

            if (response.ok && (json.success || json.code === 0)) {
                setIsRegistered(true); // Update local state immediately
                Alert.alert("Success", "Registered Successfully!", [
                    { text: "OK", onPress: () => router.push('/(tabs-student)/home') }
                ]);
            } else {
                // If backend returns "already registered" code/message, handle it
                if (json.message?.toLowerCase().includes("already registered")) {
                    setIsRegistered(true);
                    Alert.alert("Info", "You get already registered for this activity.");
                } else {
                    Alert.alert("Error", json.message || "Registration failed.");
                }
            }
        } catch (error) {
            // console.error("Registration Error:", error);
            Alert.alert("Error", "Network error. Please try again.");
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#FF4058" />
            </View>
        );
    }

    // Fallback if no activity found
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
                    <View style={{ width: 40 }} />
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
                            <Text style={styles.tagText}>
                                {activity.activityStatus === 'ENDED' ? 'ENDED' : activity.registrationState}
                            </Text>
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
                {activity.requirements && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>REQUIREMENTS</Text>
                        <View style={styles.detailsBox}>
                            <Text style={styles.requirementItem}>{activity.requirements}</Text>
                        </View>
                    </View>
                )}

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

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer Action */}
            <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom + 10, 30) }]}>
                {!isRegistered && activity?.registrationState === 'OPEN' && timeLeft !== 'Expired' && timeLeft ? (
                    <View style={{ alignItems: 'center', paddingTop: 10 }}>
                        <Text style={{ color: '#E91E63', fontWeight: 'bold', fontSize: 13 }}>
                            <Ionicons name="timer-outline" size={14} /> Ends in: {timeLeft}
                        </Text>
                    </View>
                ) : null}
                <View style={styles.divider} />
                {isRegistered ? (
                    <View style={[
                        styles.approvedContainer,
                        enrollmentStatus?.toUpperCase() === 'APPROVED' && { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
                        enrollmentStatus?.toUpperCase() === 'REJECTED' && { backgroundColor: '#FFEBEE', borderColor: '#EF9A9A' }
                    ]}>
                        <MaterialCommunityIcons
                            name={
                                enrollmentStatus?.toUpperCase() === 'APPROVED' ? "check-decagram" :
                                    enrollmentStatus?.toUpperCase() === 'REJECTED' ? "close-circle-outline" :
                                        "clock-outline"
                            }
                            size={24}
                            color={
                                enrollmentStatus?.toUpperCase() === 'APPROVED' ? "#4CAF50" :
                                    enrollmentStatus?.toUpperCase() === 'REJECTED' ? "#F44336" :
                                        "#FFC107"
                            }
                        />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={[
                                styles.approvedTitle,
                                enrollmentStatus?.toUpperCase() === 'REJECTED' && { color: '#D32F2F' },
                                enrollmentStatus?.toUpperCase() !== 'APPROVED' && enrollmentStatus?.toUpperCase() !== 'REJECTED' && { color: '#FFA000' }
                            ]}>
                                {enrollmentStatus?.toUpperCase() === 'APPROVED' ? 'Registration Accepted' :
                                    enrollmentStatus?.toUpperCase() === 'REJECTED' ? 'Registration Rejected' :
                                        'Registration Submitted'}
                            </Text>
                            <Text style={[
                                styles.approvedDate,
                                enrollmentStatus?.toUpperCase() === 'REJECTED' && { color: '#E57373' },
                                enrollmentStatus?.toUpperCase() !== 'APPROVED' && enrollmentStatus?.toUpperCase() !== 'REJECTED' && { color: '#FFB300' }
                            ]}>
                                {enrollmentStatus?.toUpperCase() === 'APPROVED' ? 'You have joined this activity' :
                                    enrollmentStatus?.toUpperCase() === 'REJECTED' ? 'Your registration was declined' :
                                        'Waiting for approval'}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[
                            styles.registerButton,
                            { backgroundColor: (activity.registrationState === 'OPEN' && activity.activityStatus !== 'ENDED') ? '#FF4058' : '#ccc' }
                        ]}
                        onPress={handleRegister}
                        disabled={activity.registrationState !== 'OPEN' || activity.activityStatus === 'ENDED'}
                    >
                        <Text style={styles.registerButtonText}>
                            {(activity.registrationState === 'OPEN' && activity.activityStatus !== 'ENDED')
                                ? 'REGISTER'
                                : (activity.activityStatus === 'ENDED' ? 'ACTIVITY ENDED' : activity.registrationState)}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    headerSafeArea: { backgroundColor: '#fff', zIndex: 10 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    backButton: { padding: 5, backgroundColor: '#F5F5F5', borderRadius: 20 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', maxWidth: '70%' },

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
        marginBottom: 50,
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
        marginTop: 25, // Increased to avoid overlap with badge
    },
    shortDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginHorizontal: 20,
        marginTop: 8,
        lineHeight: 22,
    },

    // Fixed Footer
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 30, // Safe area padding
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 10,
    },
    divider: { height: 1, backgroundColor: '#eee', marginBottom: 15 },
    registerButton: {
        backgroundColor: '#FF4058',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#FF4058', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    approvedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F5E9',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#A5D6A7'
    },
    approvedTitle: {
        color: '#2E7D32',
        fontSize: 16,
        fontWeight: 'bold'
    },
    approvedDate: {
        color: '#4CAF50',
        fontSize: 12,
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
    // divider: {... } // Removed duplicate
});
