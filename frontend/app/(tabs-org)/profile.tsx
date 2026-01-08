import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function OrgProfileScreen() {
    const router = useRouter();

    const menuItems = [
        {
            title: 'Profile Settings',
            icon: 'settings-outline' as const,
            onPress: () => router.push('/profile-settings'),
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

    const handleLogout = () => {
        // Implement logout logic here
        router.replace('/login');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuButton}>
                    <Ionicons name="menu" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>MY PROFILE</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Profile Info */}
                <View style={styles.profileInfoContainer}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={require('../../assets/images/org_image.png')}
                            style={styles.avatar}
                        />
                    </View>
                    <Text style={styles.orgName}>BK-EVENT CLUB</Text>
                    <Text style={styles.orgUniversity}>Ho Chi Minh City University Of Technology</Text>
                </View>

                {/* Divider Line */}
                <View style={styles.divider} />

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
        padding: 8,
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
        paddingBottom: 40,
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
    divider: {
        width: '80%',
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 20,
    },
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
