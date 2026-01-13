import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ImageBackground, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { Config } from '@/constants/Config';

export default function HistoryDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { activityId } = params;
    const { token } = useAuth();

    const [detail, setDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activityId) {
            fetchDetail();
        }
    }, [activityId]);

    const fetchDetail = async () => {
        try {
            const response = await fetch(`${Config.API_BASE_URL}/students/participation/history-detail?activityId=${activityId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': '*/*'
                }
            });
            const json = await response.json();
            if (json.success) {
                setDetail(json.data);
            }
        } catch (error) {
            console.error("Fetch Detail Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return '#4CAF50';
            case 'PENDING': return '#FF9800';
            case 'REJECTED': return '#F44336';
            default: return '#757575';
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#4c669f" />
            </View>
        );
    }

    if (!detail) return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 20 }}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={{ textAlign: 'center', marginTop: 20 }}>No details found.</Text>
            </SafeAreaView>
        </View>
    );

    const {
        activityTitle,
        shortDescription,
        category,
        startDateTime,
        endDateTime,
        address,
        ctxhHours,
        organizationName,
        enrollmentStatus,
        checkInTime,
        checkOutTime,
        certificateCode,
        imageUrl
    } = detail;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Image Header */}
                <ImageBackground
                    source={imageUrl ? { uri: imageUrl } : require('../assets/images/icon.png')}
                    style={styles.headerImage}
                    resizeMode="cover"
                >
                    <LinearGradient
                        colors={['rgba(0,0,0,0.5)', 'transparent']}
                        style={styles.headerOverlay}
                    >
                        <SafeAreaView edges={['top', 'left', 'right']}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                <View style={styles.backButtonCircle}>
                                    <Ionicons name="arrow-back" size={24} color="#000" />
                                </View>
                            </TouchableOpacity>
                        </SafeAreaView>
                    </LinearGradient>
                </ImageBackground>

                <View style={styles.contentSheet}>
                    {/* Title Card */}
                    <View style={styles.card}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{category}</Text>
                        </View>
                        <Text style={styles.title}>{activityTitle}</Text>
                        <Text style={styles.orgName}>by {organizationName}</Text>

                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(enrollmentStatus) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(enrollmentStatus) }]}>
                                {enrollmentStatus}
                            </Text>
                        </View>
                    </View>

                    {/* Info Grid */}
                    <View style={styles.card}>
                        <Text style={styles.sectionHeader}>Information</Text>

                        <View style={styles.row}>
                            <Ionicons name="time-outline" size={22} color="#555" style={styles.icon} />
                            <View>
                                <Text style={styles.label}>Start Time</Text>
                                <Text style={styles.value}>{formatDate(startDateTime)}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <Ionicons name="time-outline" size={22} color="#555" style={styles.icon} />
                            <View>
                                <Text style={styles.label}>End Time</Text>
                                <Text style={styles.value}>{formatDate(endDateTime)}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <Ionicons name="location-outline" size={22} color="#555" style={styles.icon} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Location</Text>
                                <Text style={styles.value}>{address}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <MaterialCommunityIcons name="star-circle-outline" size={22} color="#FF9800" style={styles.icon} />
                            <View>
                                <Text style={styles.label}>CTXH Days</Text>
                                <Text style={[styles.value, { color: '#FF9800', fontWeight: 'bold' }]}>{ctxhHours} days</Text>
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.card}>
                        <Text style={styles.sectionHeader}>Description</Text>
                        <Text style={styles.description}>{shortDescription}</Text>
                    </View>

                    {/* Attendance Info */}
                    <View style={styles.card}>
                        <Text style={styles.sectionHeader}>Attendance Record</Text>

                        <View style={styles.row}>
                            <MaterialCommunityIcons name="login" size={22} color="#4CAF50" style={styles.icon} />
                            <View>
                                <Text style={styles.label}>Check-in</Text>
                                <Text style={styles.value}>{formatDate(checkInTime)}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <MaterialCommunityIcons name="logout" size={22} color="#F44336" style={styles.icon} />
                            <View>
                                <Text style={styles.label}>Check-out</Text>
                                <Text style={styles.value}>{formatDate(checkOutTime)}</Text>
                            </View>
                        </View>

                        {certificateCode && (
                            <View style={styles.certContainer}>
                                <MaterialCommunityIcons name="certificate" size={24} color="#FFD700" />
                                <Text style={styles.certText}>Certificate: {certificateCode}</Text>
                            </View>
                        )}
                    </View>

                    <View style={{ height: 30 }} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    headerImage: {
        width: '100%',
        height: 250,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
    },
    headerOverlay: {
        flex: 1,
        paddingHorizontal: 20,
    },
    backButton: {
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    backButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    contentSheet: {
        marginTop: 15,
        backgroundColor: '#F5F7FA',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        paddingTop: 10,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 10,
    },
    categoryText: {
        color: '#1565C0',
        fontSize: 12,
        fontWeight: '600',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    orgName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
    },
    icon: {
        marginRight: 15,
        width: 24,
    },
    label: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    value: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
        marginLeft: 40,
    },
    description: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
    },
    certContainer: {
        marginTop: 15,
        backgroundColor: '#FFF8E1',
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FFECB3',
    },
    certText: {
        marginLeft: 8,
        color: '#FF8F00',
        fontWeight: 'bold',
    }
});
