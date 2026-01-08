import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function StudentActivityDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Mock data
    const activity = {
        title: params.title || "Teaching Kids Coding",
        image: params.image || require('../assets/images/ob1.png'),
        date: params.date || "Oct 25, 2025",
        time: params.time || "2:00 PM - 5:00 PM",
        location: params.location || "Community Library",
        slots: params.slots || "5/15",
        description: params.description || "Share your coding knowledge with kids aged 8-12! We'll teach basic programming concepts through fun games and interactive activities. Perfect for CS students.",
        organizer: params.organizer || "Techlead",
    };

    const handleRegister = () => {
        Alert.alert("Success", "Registered Successfully!");
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{activity.title}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Banner Image */}
                <View style={styles.imageContainer}>
                    <Image source={typeof activity.image === 'string' ? { uri: activity.image } : activity.image} style={styles.bannerImage} />
                    <View style={styles.organizerBadge}>
                        <Text style={styles.organizerText}>Organized by {activity.organizer}</Text>
                    </View>
                </View>

                {/* Tags */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>TAGS</Text>
                    <View style={styles.tagsRow}>
                        <View style={styles.tagItem}>
                            <View style={[styles.tagIcon, { backgroundColor: '#E0F7FA' }]}>
                                <Ionicons name="school-outline" size={20} color="#00BCD4" />
                            </View>
                            <Text style={styles.tagText}>Education</Text>
                        </View>
                        <View style={styles.tagItem}>
                            <View style={[styles.tagIcon, { backgroundColor: '#E8F5E9' }]}>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
                            </View>
                            <Text style={styles.tagText}>Active</Text>
                        </View>
                    </View>
                </View>

                {/* Info Grid */}
                <View style={styles.gridContainer}>
                    <View style={styles.gridRow}>
                        <View style={styles.gridItem}>
                            <View style={styles.gridHeader}>
                                <View style={[styles.gridIconContainer, { backgroundColor: '#E3F2FD' }]}>
                                    <Ionicons name="calendar" size={18} color="#2196F3" />
                                </View>
                                <Text style={styles.gridLabel}>DATE</Text>
                            </View>
                            <Text style={styles.gridValue}>{activity.date}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <View style={styles.gridHeader}>
                                <View style={[styles.gridIconContainer, { backgroundColor: '#FFF3E0' }]}>
                                    <Ionicons name="time" size={18} color="#FF9800" />
                                </View>
                                <Text style={styles.gridLabel}>TIME</Text>
                            </View>
                            <Text style={styles.gridValue}>{activity.time}</Text>
                        </View>
                    </View>
                    <View style={styles.gridRow}>
                        <View style={styles.gridItem}>
                            <View style={styles.gridHeader}>
                                <View style={[styles.gridIconContainer, { backgroundColor: '#FFEBEE' }]}>
                                    <Ionicons name="location" size={18} color="#F44336" />
                                </View>
                                <Text style={styles.gridLabel}>LOCATION</Text>
                            </View>
                            <Text style={styles.gridValue} numberOfLines={2}>{activity.location}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <View style={styles.gridHeader}>
                                <View style={[styles.gridIconContainer, { backgroundColor: '#E8F5E9' }]}>
                                    <Ionicons name="people" size={18} color="#4CAF50" />
                                </View>
                                <Text style={styles.gridLabel}>PARTICIPANTS</Text>
                            </View>
                            <Text style={styles.gridValue}>{activity.slots}</Text>
                        </View>
                    </View>
                </View>

                {/* Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>DETAILS</Text>
                    <View style={styles.detailsBox}>
                        <Text style={styles.detailsText}>{activity.description}</Text>
                    </View>
                </View>

                {/* Requirements */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>REQUIREMENTS</Text>
                    <View style={styles.detailsBox}>
                        <Text style={styles.requirementItem}>• Basic programming knowledge</Text>
                        <Text style={styles.requirementItem}>• Patient and enthusiastic</Text>
                        <Text style={styles.requirementItem}>• Laptop required</Text>
                    </View>
                </View>

                {/* Volunteer Days Card */}
                <View style={styles.volunteerCard}>
                    <View>
                        <Text style={styles.volunteerLabel}>Volunteer Days</Text>
                        <Text style={styles.volunteerValue}>1.0</Text>
                    </View>
                    <View style={styles.volunteerIcon}>
                        <MaterialCommunityIcons name="clock-time-four-outline" size={40} color="#fff" />
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Register Button Footer */}
            <View style={styles.footerContainer}>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                    <Text style={styles.registerButtonText}>REGISTER</Text>
                </TouchableOpacity>
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
    }
});
