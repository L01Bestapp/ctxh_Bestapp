import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking, Alert, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AboutAppScreen() {
    const router = useRouter();

    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');

    const openWebsite = async () => {
        const url = 'https://l01bestapp.github.io/UnivolunteerLanding/';
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert(`Don't know how to open this URL: ${url}`);
        }
    };

    const openTerms = () => {
        setModalTitle("Terms of Use");
        setModalContent("Welcome to Univolunteer! By using our app, you agree to the following terms:\n\n1. USAGE\nYou agree to use this app only for lawful purposes and in accordance with these Terms.\n\n2. ACCOUNT\nYou are responsible for maintaining the confidentiality of your account credentials.\n\n3. CONTENT\nYou retain ownership of content you post, but grant us license to use it.\n\n(This is a placeholder text for demonstration purposes.)");
        setModalVisible(true);
    };

    const openPrivacy = () => {
        setModalTitle("Privacy Policy");
        setModalContent("Your privacy is important to us.\n\nDATA COLLECTION\nWe collect information you provide directly to us.\n\nUSAGE\nWe use this info to operate and improve our services.\n\nSHARING\nWe do not share your personal info with third parties without consent, except as required by law.\n\n(This is a placeholder text for demonstration purposes.)");
        setModalVisible(true);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ABOUT</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.logoContainer}>
                    <Image source={require('../assets/images/logo_univolunt.png')} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.appName}>Univolunteer</Text>
                    <Text style={styles.version}>Version 1.0.0</Text>
                </View>

                <Text style={styles.description}>
                    Univolunteer is a platform connecting students with volunteer activities, fostering community engagement and skill development. We aim to streamline the management of volunteer work for both organizations and students at Ho Chi Minh City University of Technology.
                </Text>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.linkItem} onPress={openTerms}>
                    <Text style={styles.linkText}>Terms of Use</Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkItem} onPress={openPrivacy}>
                    <Text style={styles.linkText}>Privacy Policy</Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkItem} onPress={openWebsite}>
                    <Text style={styles.linkText}>Visit our Website</Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

                <View style={{ height: 50 }} />
                <Text style={styles.footerText}>© 2025 Univolunteer Team. All rights reserved.</Text>

            </ScrollView>

            {/* Legal Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.dragHandle} />
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>{modalTitle}</Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 5 }}>
                                        <Ionicons name="close" size={26} color="#333" />
                                    </TouchableOpacity>
                                </View>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <Text style={styles.modalText}>{modalContent}</Text>
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    backButton: { padding: 8, backgroundColor: '#F5F5F5', borderRadius: 50 },
    headerTitle: { fontSize: 18, fontWeight: '900', color: '#1A237E', letterSpacing: 0.5 },
    content: { padding: 25, alignItems: 'center' },
    logoContainer: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    logo: { width: 150, height: 80, marginBottom: 10 },
    appName: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    version: { fontSize: 14, color: '#888', marginTop: 5 },
    description: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
    divider: { width: '100%', height: 1, backgroundColor: '#eee', marginBottom: 10 },
    linkItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
    linkText: { fontSize: 16, color: '#333', fontWeight: '500' },
    footerText: { fontSize: 12, color: '#999', marginTop: 30 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingTop: 12,
        height: '80%', // Bottom sheet height
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 10,
        alignSelf: 'center',
        marginBottom: 20,
        marginTop: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A237E'
    },
    modalText: {
        fontSize: 16,
        color: '#444',
        lineHeight: 26,
        paddingBottom: 40,
    },
});
