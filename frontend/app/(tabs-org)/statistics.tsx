import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, Modal, TouchableWithoutFeedback, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, LineChart, ProgressChart } from 'react-native-chart-kit';
import { useAuth } from '@/context/AuthContext';
import HeaderAvatar from '../components/HeaderAvatar';
import NotificationBell from '../components/NotificationBell';
import { useFocusEffect, useRouter } from 'expo-router';

import { Config } from '@/constants/Config';

const { width } = Dimensions.get('window');

interface StatisticsData {
    activityStats: {
        totalActivities: number;
        upcomingCount: number;
        ongoingCount: number;
        completedCount: number;
        canceledCount: number;
    };
    participantStats: {
        totalSlots: number;
        totalRegistrations: number;
        totalApproved: number;
        totalAttended: number;
        avgAttendanceRate: number;
    };
    impactStats: {
        totalCtxhDaysGenerated: number;
    };
}

// Interfaces
interface Activity {
    activityId: number;
    title: string;
    registrationState: string;
    activityStatus: string;
    approvedParticipants: number;
    maxParticipants: number;
    createdAt: string;
    startDateTime: string;
    registrationDeadline: string;
}

interface AttendanceSummary {
    activityTitle: string;
    totalEnrolled: number;
    totalPresent: number;
    totalAbsent: number;
    attendanceRate: number;
    activityStartDate: string;
}

// Colors
const COLORS = {
    primary: '#FF4058',
    secondary: '#42A5F5',
    success: '#66BB6A',
    warning: '#FFA726',
    text: '#333333',
    subText: '#757575',
    cardBg: '#FFFFFF',
    background: '#F5F5F7'
};

export default function OrgStatisticsScreen() {
    const router = useRouter();
    const { token, user } = useAuth();

    // State
    const [stats, setStats] = useState<StatisticsData | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [attendanceStats, setAttendanceStats] = useState<AttendanceSummary | null>(null);
    const [loadingModal, setLoadingModal] = useState(false);

    // Initial Fetch
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchStatistics(), fetchActivities()]);
        setLoading(false);
    };

    const fetchStatistics = async () => {
        try {
            const response = await fetch(`${Config.API_BASE_URL}/organization/statistics`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await response.json();
            if (json.success && json.data) {
                setStats(json.data);
            }
        } catch (error) {
            console.error("Fetch Stats Error:", error);
        }
    };

    const fetchActivities = async () => {
        try {
            const response = await fetch(`${Config.API_BASE_URL}/activities/get-all-activity-for-organization`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await response.json();
            if (json.success && Array.isArray(json.data)) {
                // Sort by date descending
                const sorted = json.data.sort((a: Activity, b: Activity) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setActivities(sorted);
            }
        } catch (error) {
            console.error("Fetch Activities Error:", error);
        }
    };

    const fetchAttendanceDetails = async (activityId: number) => {
        try {
            setLoadingModal(true);
            const response = await fetch(`${Config.API_BASE_URL}/activities/${activityId}/attendance/summary`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await response.json();
            if (json.success && json.data) {
                setAttendanceStats(json.data);
            }
        } catch (error) {
            console.error("Fetch Attendance Error:", error);
        } finally {
            setLoadingModal(false);
        }
    };

    const handleActivityPress = (activity: Activity) => {
        setSelectedActivity(activity);
        setAttendanceStats(null); // Reset prev data
        setModalVisible(true);
        fetchAttendanceDetails(activity.activityId);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const cardData = [
        {
            title: 'Activity',
            icon: 'pulse-outline' as const,
            image: require('../../assets/images/ac_card.png'),
            value: stats ? stats.activityStats.totalActivities.toString() : '0',
            label: 'created',
            bgColor: '#90CAF9',
            textColor: '#fff',
        },
        {
            title: 'Participant',
            icon: 'people-outline' as const,
            image: require('../../assets/images/student_card.png'),
            value: stats ? stats.participantStats.totalApproved.toString() : '0',
            label: 'approved',
            bgColor: '#EF9A9A',
            textColor: '#fff',
        },
        {
            title: 'CTXH DAYS',
            icon: 'hourglass-outline' as const,
            image: require('../../assets/images/hour_card.png'),
            value: stats ? stats.impactStats.totalCtxhDaysGenerated.toFixed(1) : '0',
            label: 'generated',
            bgColor: '#CE93D8',
            textColor: '#fff',
        },
    ];

    // Data for Line Chart (Last 6 activities)
    const recentActivities = activities.slice(0, 6).reverse(); // Reverse to show timeline left-right
    const chartLabels = recentActivities.map(a => {
        // Shorten title
        return a.title.length > 5 ? a.title.substring(0, 5) + '..' : a.title;
    });
    const chartData = recentActivities.map(a => a.approvedParticipants);

    // If no data, provide dummy for visual safety or hide
    const safeChartData = chartData.length > 0 ? chartData : [0];
    const safeChartLabels = chartLabels.length > 0 ? chartLabels : ['No Data'];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <NotificationBell />
                <Image source={require('../../assets/images/logo_univolun.png')} style={styles.logo} resizeMode="contain" />
                <HeaderAvatar />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Summary Cards */}
                <View style={styles.cardsContainer}>
                    {cardData.map((item, index) => (
                        <View key={index} style={[styles.card, { backgroundColor: item.bgColor }]}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Ionicons name={item.icon} size={18} color="#fff" />
                            </View>
                            <View style={styles.cardContent}>
                                <Image source={item.image} style={styles.cardImage} resizeMode="contain" />
                            </View>
                            <View style={styles.cardFooter}>
                                <Text style={styles.cardValue}>{item.value}</Text>
                                <Text style={styles.cardLabel}>{item.label}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Participation Overview (Pie Chart) - Reusing existing structure logic if present or keeping logical */}
                {/* Keeping the existing Participation Overview section but simplifying for brevity in this replacement */}
                <View style={styles.chartSection}>
                    <Text style={styles.sectionTitle}>PARTICIPATION OVERVIEW</Text>
                    {stats ? (
                        <View style={styles.participationContainer}>
                            {/* Simplified Stats Grid instead of just Pie */}
                            <View style={styles.detailsGrid}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailValue}>{stats.participantStats.totalSlots}</Text>
                                    <Text style={styles.detailLabel}>Slots</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailValue}>{stats.participantStats.totalRegistrations}</Text>
                                    <Text style={styles.detailLabel}>Register</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailValue}>{stats.participantStats.totalApproved}</Text>
                                    <Text style={styles.detailLabel}>Approve</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={[styles.detailValue, { color: COLORS.success }]}>{stats.participantStats.totalAttended}</Text>
                                    <Text style={styles.detailLabel}>Attended</Text>
                                </View>
                            </View>

                            <View style={{ alignItems: 'center' }}>
                                <View style={{ width: width - 60, height: 220, alignItems: 'center', justifyContent: 'center' }}>
                                    <ProgressChart
                                        data={{
                                            labels: ["Attendance"],
                                            data: [Math.min(
                                                (stats.participantStats.avgAttendanceRate > 1
                                                    ? stats.participantStats.avgAttendanceRate / 100
                                                    : stats.participantStats.avgAttendanceRate),
                                                1.0
                                            )]
                                        }}
                                        width={width - 60}
                                        height={220}
                                        strokeWidth={16}
                                        radius={80}
                                        chartConfig={{
                                            backgroundColor: "#fff",
                                            backgroundGradientFrom: "#fff",
                                            backgroundGradientTo: "#fff",
                                            color: (opacity = 1) => `rgba(41, 182, 246, ${opacity})`,
                                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                            style: { borderRadius: 16 },
                                            propsForDots: { r: "6", strokeWidth: "2", stroke: "#ffa726" }
                                        }}
                                        hideLegend={true}
                                    />
                                    {/* Center Text (Donut Hole) */}
                                    <View style={styles.donutHole}>
                                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#29B6F6' }}>
                                            {/* Display as percentage (e.g. 85.5%) */}
                                            {stats.participantStats.avgAttendanceRate > 1
                                                ? stats.participantStats.avgAttendanceRate.toFixed(1)
                                                : (stats.participantStats.avgAttendanceRate * 100).toFixed(1)}%
                                        </Text>
                                        <Text style={{ fontSize: 12, color: '#78909C', fontWeight: '600' }}>RATE</Text>
                                    </View>
                                </View>

                                {/* Custom Legend */}
                                <View style={styles.customLegendContainer}>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: '#29B6F6' }]} />
                                        <Text style={styles.legendText}>Attended</Text>
                                        <Text style={styles.legendValue}>{stats.participantStats.avgAttendanceRate.toFixed(1)}%</Text>
                                    </View>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: '#81D4FA' }]} />
                                        <Text style={styles.legendText}>Absent</Text>
                                        <Text style={styles.legendValue}>{(100 - stats.participantStats.avgAttendanceRate).toFixed(1)}%</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <ActivityIndicator size="large" color="#42A5F5" />
                    )}
                </View>

                {/* Activity Trends Line Chart */}
                <View style={[styles.chartSection, { marginTop: 20 }]}>
                    <Text style={styles.sectionTitle}>ACTIVITY GROWTH TRENDS</Text>
                    <Text style={styles.chartSubtitle}>Participants per recent activity</Text>
                    {activities.length > 0 ? (
                        <LineChart
                            data={{
                                labels: safeChartLabels,
                                datasets: [{ data: safeChartData }]
                            }}
                            width={width - 40}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={{
                                backgroundColor: '#fff',
                                backgroundGradientFrom: '#fff',
                                backgroundGradientTo: '#fff',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(255, 64, 88, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: { borderRadius: 16 },
                                propsForDots: { r: "5", strokeWidth: "2", stroke: "#ffa726" }
                            }}
                            bezier
                            style={styles.chartStyle}
                        />
                    ) : (
                        <Text style={styles.noDataText}>No activities to display trends.</Text>
                    )}
                </View>

                {/* Activity List */}
                <View style={[styles.chartSection, { marginTop: 10, paddingBottom: 40 }]}>
                    <Text style={styles.sectionTitle}>RECENT ACTIVITIES</Text>
                    {activities.map((item) => (
                        <TouchableOpacity
                            key={item.activityId}
                            style={styles.activityItem}
                            onPress={() => handleActivityPress(item)}
                        >
                            <View style={[styles.activityIconBox, { backgroundColor: item.registrationState === 'OPEN' ? '#E0F2F1' : '#FFEBEE' }]}>
                                <Ionicons
                                    name={item.registrationState === 'OPEN' ? 'flag-outline' : 'lock-closed-outline'}
                                    size={20}
                                    color={item.registrationState === 'OPEN' ? '#009688' : '#D32F2F'}
                                />
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityTitle} numberOfLines={1}>{item.title}</Text>
                                <Text style={styles.activityDate}>{new Date(item.startDateTime).toLocaleDateString()}</Text>
                            </View>
                            <View style={styles.activityRight}>
                                <Text style={styles.activityStatsText}>{item.approvedParticipants}/{item.maxParticipants}</Text>
                                <Text style={styles.activityLabel}>Joined</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>

            {/* Attendance Detail Modal */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View style={styles.modalOverlay} />
                    </TouchableWithoutFeedback>

                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Attendance Summary</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color="#ccc" />
                            </TouchableOpacity>
                        </View>

                        {loadingModal ? (
                            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
                        ) : attendanceStats ? (
                            <View>
                                <Text style={styles.modalActivityTitle}>{attendanceStats.activityTitle}</Text>
                                <Text style={styles.modalDate}>
                                    Date: {new Date(attendanceStats.activityStartDate).toLocaleDateString()}
                                </Text>

                                <View style={styles.statRow}>
                                    <View style={[styles.statBox, { backgroundColor: '#E3F2FD' }]}>
                                        <Text style={[styles.statNumber, { color: '#1976D2' }]}>{attendanceStats.totalEnrolled}</Text>
                                        <Text style={styles.statLabel}>Enrolled</Text>
                                    </View>
                                    <View style={[styles.statBox, { backgroundColor: '#E8F5E9' }]}>
                                        <Text style={[styles.statNumber, { color: '#388E3C' }]}>{attendanceStats.totalPresent}</Text>
                                        <Text style={styles.statLabel}>Present</Text>
                                    </View>
                                </View>
                                <View style={styles.statRow}>
                                    <View style={[styles.statBox, { backgroundColor: '#FFEBEE' }]}>
                                        <Text style={[styles.statNumber, { color: '#D32F2F' }]}>{attendanceStats.totalAbsent}</Text>
                                        <Text style={styles.statLabel}>Absent</Text>
                                    </View>
                                    <View style={[styles.statBox, { backgroundColor: '#FFF3E0' }]}>
                                        <Text style={[styles.statNumber, { color: '#F57C00' }]}>{(attendanceStats.attendanceRate * 1).toFixed(1)}%</Text>
                                        <Text style={styles.statLabel}>Rate</Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <Text style={{ textAlign: 'center', marginVertical: 20, color: '#888' }}>
                                No data available.
                            </Text>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F7',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 50,
    },
    logo: {
        width: 100,
        height: 40,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    cardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginTop: 15,
    },
    card: {
        width: (width - 45) / 3,
        padding: 8,
        borderRadius: 16,
        height: 140,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    cardTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#fff',
    },
    cardContent: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    cardImage: {
        width: 80,
        height: 60,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between'
    },
    cardValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    cardLabel: {
        fontSize: 8,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'right',
        marginLeft: 2,
        marginBottom: 2,
    },
    chartSection: {
        backgroundColor: '#fff',
        marginTop: 15,
        marginHorizontal: 15,
        padding: 15,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        alignItems: 'center', // Added for PieChart centering
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        letterSpacing: 0.5,
        alignSelf: 'flex-start',
    },
    chartSubtitle: {
        fontSize: 12,
        color: '#888',
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    chartStyle: {
        borderRadius: 16,
        marginVertical: 8,
    },
    participationContainer: {
        alignItems: 'center',
        width: '100%',
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
    },
    detailItem: {
        width: '23%',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        paddingVertical: 10,
        borderRadius: 10,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    detailLabel: {
        fontSize: 10,
        color: '#888',
        marginTop: 2,
    },
    pieContainer: {
        alignItems: 'center',
    },
    chartCaption: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        fontStyle: 'italic',
    },
    noDataText: {
        textAlign: 'center',
        padding: 20,
        color: '#999',
    },
    // Activity List Styles
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        width: '100%',
    },
    activityIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    activityDate: {
        fontSize: 11,
        color: '#999',
    },
    activityRight: {
        alignItems: 'flex-end',
        marginRight: 10,
    },
    activityStatsText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    activityLabel: {
        fontSize: 10,
        color: '#999',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalOverlay: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        minHeight: 350,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalActivityTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    modalDate: {
        fontSize: 12,
        color: '#888',
        marginBottom: 20,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    statBox: {
        width: '48%',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    // Ranking Section
    rankingContainer: {
        marginHorizontal: 15,
        marginTop: 20,
        marginBottom: 20,
    },
    rankingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    rankingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    seeAllText: {
        fontSize: 12,
        color: '#42A5F5',
        fontWeight: 'bold',
    },
    rankingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 12,
        marginBottom: 10,
    },
    rankBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFEBEE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    rankText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#D32F2F',
    },
    rankAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    rankInfo: {
        flex: 1,
    },
    rankName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    rankScore: {
        fontSize: 12,
        color: '#888',
    },

    // Participation Details Grid
    detailsContainer: {
        width: '100%',
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
    },
    detailsTitle: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailValueContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#eee',
    },

    // Chart Components
    chartContainer: {
        marginHorizontal: 15,
        marginTop: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 15,
        alignSelf: 'flex-start',
    },
    donutHole: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: 160,
        height: 160,
    },
    customLegendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: -20,
        marginBottom: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 15,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    legendText: {
        color: '#666',
        fontSize: 12,
        marginRight: 4,
    },
    legendValue: {
        fontWeight: 'bold',
        color: '#333',
        fontSize: 12,
    },
});
