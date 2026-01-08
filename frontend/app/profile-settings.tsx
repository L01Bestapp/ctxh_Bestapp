import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal,
    Alert,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileSettingsScreen() {
    const router = useRouter();

    // State for form fields
    const [email, setEmail] = useState('aashifa@gmail.com');
    const [orgName, setOrgName] = useState('BK-EVENT CLUB');
    const [phoneNumber, setPhoneNumber] = useState('0111222333444');
    const [type, setType] = useState('Volunteer Activity Club');
    const [university, setUniversity] = useState('Ho Chi Minh City University Of Technology');
    const [department, setDepartment] = useState('Computer Science and Engineering');

    // Image Picker State
    const [avatar, setAvatar] = useState(require('../assets/images/org_image.png'));

    // Password Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleEditImage = async () => {
        Alert.alert(
            "Update Profile Picture",
            "Choose an option",
            [
                {
                    text: "Camera",
                    onPress: openCamera
                },
                {
                    text: "Gallery",
                    onPress: openGallery
                },
                {
                    text: "Cancel",
                    style: "cancel"
                }
            ]
        );
    };

    const openCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission to access camera is required!");
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) {
            setAvatar({ uri: result.assets[0].uri });
        }
    };

    const openGallery = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission to access gallery is required!");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) {
            setAvatar({ uri: result.assets[0].uri });
        }
    };

    const handleChangePassword = () => {
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match!");
            return;
        }
        // Construct API call here
        console.log("Updating password...");
        setModalVisible(false);
        // Clear fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        Alert.alert("Success", "Password updated successfully!");
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>UPDATE PROFILE</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Avatar Section */}
                    <View style={styles.avatarContainer}>
                        <Image source={avatar} style={styles.avatar} />
                        <TouchableOpacity style={styles.editIconContainer} onPress={handleEditImage}>
                            <Ionicons name="camera" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Section: Personal Details */}
                    <Text style={styles.sectionTitle}>Personal Details</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        {/* Visual Dummy Input for Password */}
                        <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                            <Text style={{ color: '#333', fontSize: 18, letterSpacing: 2 }}>••••••••</Text>
                        </View>
                        <TouchableOpacity style={styles.changePassLink} onPress={() => setModalVisible(true)}>
                            <Text style={styles.changePassText}>Change Password</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Organization Name</Text>
                        <TextInput
                            style={styles.input}
                            value={orgName}
                            onChangeText={setOrgName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Type</Text>
                        <TouchableOpacity style={styles.dropdownInput}>
                            <Text style={styles.inputText}>{type}</Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Section: Affiliation Details */}
                    <Text style={styles.sectionTitle}>Affiliation Details</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>University</Text>
                        <TextInput
                            style={styles.input}
                            value={university}
                            onChangeText={setUniversity}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Department</Text>
                        <TextInput
                            style={styles.input}
                            value={department}
                            onChangeText={setDepartment}
                        />
                    </View>

                    <View style={{ height: 20 }} />

                    {/* Save Button */}
                    <TouchableOpacity style={styles.saveButton} onPress={() => router.back()}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Change Password Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Change Password</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.modalLabel}>Current Password</Text>
                            <TextInput
                                style={styles.modalInput}
                                secureTextEntry
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder="Enter current password"
                            />

                            <Text style={styles.modalLabel}>New Password</Text>
                            <TextInput
                                style={styles.modalInput}
                                secureTextEntry
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Enter new password"
                            />

                            <Text style={styles.modalLabel}>Confirm New Password</Text>
                            <TextInput
                                style={styles.modalInput}
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm new password"
                            />

                            <TouchableOpacity style={styles.updatePassButton} onPress={handleChangePassword}>
                                <Text style={styles.saveButtonText}>Update Password</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
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
        padding: 20,
    },
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: 30,
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#2196F3',
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 15,
        fontSize: 15,
        color: '#333',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    dropdownInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    inputText: {
        fontSize: 15,
        color: '#333',
    },
    changePassLink: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    changePassText: {
        color: '#FF455B',
        fontSize: 13,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#FF455B',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: "#FF455B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 25,
        paddingBottom: 40,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        marginTop: 10,
        fontWeight: '500',
    },
    modalInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 15,
        fontSize: 15,
        color: '#333',
        marginBottom: 5,
    },
    updatePassButton: {
        backgroundColor: '#2196F3', // Blue for this action to distinguish
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 25,
        shadowColor: "#2196F3",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    }
});
