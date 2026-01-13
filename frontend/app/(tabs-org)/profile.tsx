import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Config } from '@/constants/Config';

export default function OrgProfileScreen() {
    const router = useRouter();
    const { token, logout } = useAuth();
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (token) fetchProfile();
        }, [token])
    );

    const fetchProfile = async () => {
        try {
            const response = await fetch(`${Config.API_BASE_URL}/organization/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await response.json();
            if (json.success) {
                setProfileData(json.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProfile();
    }, []);

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    const InfoRow = ({ icon, label, value, color = "#555" }: { icon: any, label: string, value: string | undefined, color?: string }) => (
        <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <MaterialCommunityIcons name={icon} size={20} color={color} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || 'N/A'}</Text>
            </View>
        </View>
    );

    const menuItems = [
        {
            title: 'Profile Settings',
            icon: 'settings-outline' as const,
            onPress: () => router.push('/org-profile-settings'),
        },
        {
            title: 'Change Password',
            icon: 'lock-closed-outline' as const,
            onPress: () => router.push('/change-password'),
        },
        {
            title: 'Notification Settings',
            icon: 'notifications-outline' as const,
            onPress: () => router.push('/notification-settings'),
        },
        {
            title: 'Send Feedback',
            icon: 'chatbubble-ellipses-outline' as const,
            onPress: () => router.push('/send-feedback'),
        },
        {
            title: 'About Univolunteer',
            icon: 'information-circle-outline' as const,
            onPress: () => router.push('/about-app'),
        },
    ];

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#1A237E" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.menuButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>MY PROFILE</Text>
                <TouchableOpacity style={styles.editButton} onPress={() => router.push('/org-profile-settings')}>
                    <Ionicons name="create-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1A237E"]} />}
            >

                {/* Profile Info */}
                <View style={styles.profileInfoContainer}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={profileData?.avatarUrl ? { uri: profileData.avatarUrl } : require('../../assets/images/org_image.png')}
                            style={styles.avatar}
                        />
                    </View>
                    <Text style={styles.orgName}>{profileData?.organizationName || 'Organization'}</Text>
                    <Text style={styles.orgUniversity}>Ho Chi Minh City University Of Technology</Text>
                    {profileData?.bio && <Text style={styles.subInfoItalic}>"{profileData.bio}"</Text>}
                </View>

                {/* Divider Line */}
                <View style={styles.divider} />

                {/* Organization Information Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Organization Information</Text>
                    <View style={styles.infoCard}>
                        <InfoRow
                            icon="domain"
                            label="Organization Type"
                            value={profileData?.type?.replace(/_/g, ' ') || profileData?.organizationType?.replace(/_/g, ' ')}
                            color="#FF9800"
                        />
                        <InfoRow
                            icon="email-outline"
                            label="Organization Email"
                            value={profileData?.email}
                            color="#E91E63"
                        />
                        <InfoRow
                            icon="calendar-clock"
                            label="Member Since"
                            value={profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : undefined}
                            color="#009688"
                        />
                    </View>
                </View>

                {/* Representative Information Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Representative Information</Text>
                    <View style={styles.infoCard}>
                        <InfoRow
                            icon="account-tie-outline"
                            label="Representative Name"
                            value={profileData?.representativeName}
                            color="#673AB7"
                        />
                        <InfoRow
                            icon="email-outline"
                            label="Representative Email"
                            value={profileData?.representativeEmail}
                            color="#2196F3"
                        />
                        <InfoRow
                            icon="phone-outline"
                            label="Phone Number"
                            value={profileData?.representativePhoneNumber}
                            color="#4CAF50"
                        />
                    </View>
                </View>

                {/* Menu Options */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name={item.icon} size={22} color="#333" style={styles.menuIcon} />
                                <Text style={styles.menuItemText}>{item.title}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Log out</Text>
                        <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginLeft: 10 }} />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    menuButton: {
        padding: 5,
    },
    editButton: {
        padding: 5,
        backgroundColor: '#F5F5F5',
        borderRadius: 50,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1A237E',
        letterSpacing: 0.5,
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 120,
    },
    profileInfoContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    avatarContainer: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
        marginBottom: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#fff',
    },
    orgName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    orgUniversity: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    subInfoItalic: {
        fontSize: 13,
        color: '#888',
        textAlign: 'center',
        paddingHorizontal: 40,
        fontStyle: 'italic',
        marginTop: 6,
    },
    divider: {
        width: '80%',
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 20,
    },
    // New Sections Styles
    sectionContainer: {
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#888',
        marginBottom: 10,
        marginLeft: 10,
        letterSpacing: 1,
        alignSelf: 'flex-start',
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
        width: '100%',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    // Menu
    menuContainer: {
        width: '100%',
        paddingHorizontal: 20,
        gap: 15,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        marginRight: 15,
    },
    menuItemText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    logoutContainer: {
        marginTop: 40,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logoutButton: {
        backgroundColor: '#FF455B',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        width: '60%',
        borderRadius: 12,
        shadowColor: "#FF455B",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    logoutText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
