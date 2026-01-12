import React, { useState, useEffect } from 'react';
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
    Alert,
    ActivityIndicator,
    Modal,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

export default function OrgProfileSettingsScreen() {
    const router = useRouter();
    const { token, updateUser } = useAuth();

    // Data State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [orgData, setOrgData] = useState<any>(null);

    // Form Fields
    const [representativeName, setRepresentativeName] = useState('');
    const [representativeEmail, setRepresentativeEmail] = useState('');
    const [representativePhoneNumber, setRepresentativePhoneNumber] = useState('');
    const [bio, setBio] = useState('');
    const [orgType, setOrgType] = useState('');

    // Read-only / Display fields
    const [organizationName, setOrganizationName] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    // Dropdown State
    const [modalVisible, setModalVisible] = useState(false);
    const orgTypes = [
        { label: 'University Department', value: 'UNIVERSITY_DEPARTMENT' },
        { label: 'Student Union', value: 'STUDENT_UNION' },
        { label: 'Club', value: 'CLUB' },
        { label: 'NGO', value: 'NGO' },
        { label: 'Company', value: 'COMPANY' },
        { label: 'Government', value: 'GOVERNMENT' },
        { label: 'Charity', value: 'CHARITY' },
        { label: 'Foundation', value: 'FOUNDATION' },
        { label: 'Community Group', value: 'COMMUNITY_GROUP' },
        { label: 'Other', value: 'OTHER' }
    ];

    useEffect(() => {
        if (token) {
            fetchProfile();
        }
    }, [token]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://marg-astonishing-matthias.ngrok-free.dev/api/v1/organization/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await response.json();
            if (json.success) {
                const data = json.data;
                setOrgData(data);

                // Populate fields
                setOrganizationName(data.organizationName || '');
                setEmail(data.email || '');
                setAvatarUrl(data.avatarUrl || '');
                setOrgType(data.type || '');

                // Editable fields
                setRepresentativeName(data.representativeName || '');
                setRepresentativeEmail(data.representativeEmail || '');
                setRepresentativePhoneNumber(data.representativePhoneNumber || '');
                setBio(data.bio || '');

            } else {
                Alert.alert("Error", "Failed to fetch profile data");
            }
        } catch (error) {
            console.error("Fetch Profile Error:", error);
            Alert.alert("Error", "An error occurred while loading profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const body = {
                representativeName,
                representativeEmail,
                representativePhoneNumber,
                bio,
                organizationType: orgType
            };

            const response = await fetch('https://marg-astonishing-matthias.ngrok-free.dev/api/v1/organization/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const json = await response.json();
            // console.log("DEBUG: Update Profile Response:", JSON.stringify(json));

            if (json.success) {
                Alert.alert("Success", "Profile updated successfully!", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                let errorMessage = json.message || "Failed to update profile";
                if (json.data && typeof json.data === 'object' && !Array.isArray(json.data)) {
                    // Extract validation errors
                    const validationErrors = Object.entries(json.data)
                        .map(([key, msg]) => `• ${key}: ${msg}`)
                        .join('\n');
                    if (validationErrors) {
                        errorMessage += `\n${validationErrors}`;
                    }
                }
                Alert.alert("Error", errorMessage);
            }
        } catch (error) {
            console.error("Update Profile Error:", error);
            Alert.alert("Error", "An error occurred while updating profile");
        } finally {
            setSaving(false);
        }
    };

    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                uploadAvatar(result.assets[0]);
            }
        } catch (error) {
            console.error("Image Picker Error:", error);
            Alert.alert("Error", "Failed to pick image");
        }
    };

    const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
        setUploadingAvatar(true);
        try {
            const formData = new FormData();

            // Append file
            const fileCheck = {
                uri: asset.uri,
                name: asset.fileName || 'avatar.jpg',
                type: asset.mimeType || 'image/jpeg'
            } as any;

            formData.append('avatar', fileCheck);

            const response = await fetch('https://marg-astonishing-matthias.ngrok-free.dev/api/v1/auth/me/image', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            const json = await response.json();
            if (response.ok && json.success) {
                if (typeof json.data === 'string' && json.data.startsWith('http')) {
                    setAvatarUrl(json.data);
                    updateUser({ avatarUrl: json.data });
                } else {
                    fetchProfile();
                }
                Alert.alert("Success", "Avatar updated successfully!");
            } else {
                Alert.alert("Error", json.message || "Failed to upload avatar");
            }
        } catch (error) {
            console.error("Upload Avatar Error:", error);
            Alert.alert("Error", "An error occurred while uploading avatar");
        } finally {
            setUploadingAvatar(false);
        }
    };

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

                    {/* Avatar Display Only */}
                    <View style={styles.avatarContainer}>
                        <Image
                            source={avatarUrl ? { uri: avatarUrl } : require('./(tabs-org)/../../assets/images/org_image.png')}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editAvatarButton} onPress={handlePickImage} disabled={uploadingAvatar}>
                            {uploadingAvatar ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons name="camera" size={20} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Section: Organization Details */}
                    <Text style={styles.sectionTitle}>Organization Details</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Organization Name (Read-only)</Text>
                        <TextInput
                            style={[styles.input, styles.readOnlyInput]}
                            value={organizationName}
                            editable={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Organization Type</Text>
                        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.pickerButton}>
                            <Text style={styles.pickerText}>
                                {orgType ? orgTypes.find(t => t.value === orgType)?.label || orgType : 'Select Organization Type'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address (Read-only)</Text>
                        <TextInput
                            style={[styles.input, styles.readOnlyInput]}
                            value={email}
                            editable={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Brief description of the organization..."
                            multiline
                        />
                    </View>

                    {/* Section: Representative Info */}
                    <Text style={styles.sectionTitle}>Representative Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Representative Name</Text>
                        <TextInput
                            style={styles.input}
                            value={representativeName}
                            onChangeText={setRepresentativeName}
                            placeholder="Enter representative name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Representative Email</Text>
                        <TextInput
                            style={styles.input}
                            value={representativeEmail}
                            onChangeText={setRepresentativeEmail}
                            placeholder="Enter representative email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Representative Phone</Text>
                        <TextInput
                            style={styles.input}
                            value={representativePhoneNumber}
                            onChangeText={setRepresentativePhoneNumber}
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={{ height: 20 }} />

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, saving && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Global Modal for Org Type Selection */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Organization Type</Text>
                        <FlatList
                            data={orgTypes}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setOrgType(item.value);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item.label}</Text>
                                    {orgType === item.value && (
                                        <Ionicons name="checkmark" size={20} color="#2196F3" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
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
        backgroundColor: '#eee'
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#2196F3',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
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
    readOnlyInput: {
        backgroundColor: '#F5F5F5',
        color: '#888',
        borderColor: '#EEE',
    },
    pickerButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerText: {
        fontSize: 15,
        color: '#333',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxHeight: '60%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#1A237E',
    },
    modalItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalItemText: {
        fontSize: 16,
        color: '#333',
    }
});
