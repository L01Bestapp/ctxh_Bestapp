import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import CertificateModal from '../components/CertificateModal';

const { width } = Dimensions.get('window');

const STATS_DATA = [
    { title: 'Days', value: '10', icon: 'calendar-month', type: 'mci', color: '#FF9800' },
    { title: 'Certificates', value: '12', icon: 'certificate', type: 'fa5', color: '#2196F3' },
    { title: 'Activity Joined', value: '12', icon: 'account-group', type: 'mci', color: '#E91E63' },
    { title: 'Rank', value: '#15', sub: '/ 500', icon: 'trophy', type: 'ion', color: '#FFC107' }, // Adjusted color
];

const ACHIEVEMENTS_DATA = [
    {
        id: 1,
        title: 'First Time',
        subtitle: 'Completed first activity',
        icon: 'medal',
        color: '#FF9800',
    },
    {
        id: 2,
        title: 'Up Rank',
        subtitle: 'Up to Rank #12',
        icon: 'trending-up',
        color: '#4CAF50',
    },
    {
        id: 3,
        title: '10 days Volunteer',
        subtitle: 'Volunteered + 10 days',
        icon: 'calendar-heart',
        color: '#E91E63',
    },
];

export default function StudentStatisticsScreen() {
    const router = useRouter();

    const [modalVisible, setModalVisible] = useState(false);

    const renderIcon = (item: any) => {
        if (item.type === 'ion') return <Ionicons name={item.icon} size={24} color={item.color} />;
        if (item.type === 'fa5') return <FontAwesome5 name={item.icon} size={20} color={item.color} />;
        if (item.type === 'mci') return <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />;
        return null;
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Modern Gradient Header */}
                <LinearGradient
                    colors={['#FF8A9B', '#FF4058']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <SafeAreaView style={{ flex: 1, alignItems: 'center' }}>
                        <View style={styles.headerContent}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={require('../../assets/images/student_image.png')}
                                    style={styles.avatar}
                                />
                                <View style={styles.badge}>
                                    <Ionicons name="shield-checkmark" size={14} color="#fff" />
                                </View>
                            </View>
                            <Text style={styles.userName}>Sarah Taylor</Text>
                            <Text style={styles.userEmail}>sarah.taylor@student.hcmut.edu.vn</Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                {/* Overlapping Content Container */}
                <View style={styles.mainContent}>

                    {/* Statistics Grid */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>STATISTICS</Text>
                    </View>

                    <View style={styles.statsGrid}>
                        {STATS_DATA.map((item, index) => (
                            <View key={index} style={styles.statCard}>
                                <View style={[styles.statIconContainer, { backgroundColor: item.color + '15' }]}>
                                    {renderIcon(item)}
                                </View>
                                <View style={styles.statInfo}>
                                    <Text style={styles.statLabel}>{item.title}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                        <Text style={styles.statValue}>{item.value}</Text>
                                        {item.sub && <Text style={styles.statSub}>{item.sub}</Text>}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Achievements List */}
                    <View style={[styles.sectionHeader, { marginTop: 25 }]}>
                        <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
                    </View>

                    <View style={styles.achievementsContainer}>
                        {ACHIEVEMENTS_DATA.map((item) => (
                            <View key={item.id} style={styles.achievementItem}>
                                <View style={[styles.achievementIconBox, { backgroundColor: item.color + '20' }]}>
                                    <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
                                </View>
                                <View style={styles.achievementContent}>
                                    <Text style={styles.achievementTitle}>{item.title}</Text>
                                    <Text style={styles.achievementSubtitle}>{item.subtitle}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#CCC" />
                            </View>
                        ))}
                    </View>

                    {/* View Certificate Button */}
                    <TouchableOpacity style={styles.certificateButton} onPress={() => setModalVisible(true)}>
                        <LinearGradient
                            colors={['#FF4058', '#FF8A9B']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <MaterialCommunityIcons name="certificate-outline" size={24} color="#fff" />
                            <Text style={styles.certificateButtonText}>View Certificate</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>

            {/* Certificate Modal */}
            <CertificateModal visible={modalVisible} onClose={() => setModalVisible(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },
    scrollContent: {
        paddingBottom: 100,
    },

    // Gradient Header
    headerGradient: {
        width: '100%',
        paddingBottom: 30, // Reduced from 50 since no overlap
        paddingTop: 10,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 20, // Add spacing below header
    },
    headerContent: {
        alignItems: 'center',
        marginTop: 20
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.9)',
    },
    badge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4CAF50',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },

    // Main Content (No Overlap)
    mainContent: {
        flex: 1,
    },

    // Section Headers
    sectionHeader: {
        paddingHorizontal: 20,
        marginBottom: 15,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#888',
        letterSpacing: 2,
        backgroundColor: '#fff',
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    statCard: {
        width: (width - 55) / 2,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        justifyContent: 'space-between',
    },
    statIconContainer: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statInfo: {
        alignItems: 'flex-start',
    },
    statLabel: {
        fontSize: 13,
        color: '#888',
        marginBottom: 4,
        fontWeight: '600',
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    statSub: {
        fontSize: 12,
        color: '#AAA',
        marginLeft: 4,
        fontWeight: '500',
    },

    // Achievements
    achievementsContainer: {
        paddingHorizontal: 20,
    },
    achievementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 18,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
        elevation: 2,
    },
    achievementIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    achievementContent: {
        flex: 1,
    },
    achievementTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3,
    },
    achievementSubtitle: {
        fontSize: 13,
        color: '#888',
    },

    // Certificate Button
    certificateButton: {
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 16,
        shadowColor: "#FF4058",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 15,
        elevation: 8,
    },
    buttonGradient: {
        flexDirection: 'row',
        paddingVertical: 18,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    certificateButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 10,
    },
});
