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
    Keyboard,
    ActivityIndicator,
    Modal,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Config } from '@/constants/Config';
import * as ImagePicker from 'expo-image-picker';


export default function StudentProfileSettingsScreen() {
    const router = useRouter();
    const { token, updateUser } = useAuth();

    // Data State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [studentData, setStudentData] = useState<any>(null); // Store full object for reference

    // Form Fields
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gender, setGender] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [faculty, setFaculty] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [bio, setBio] = useState('');

    // Read-only fields
    const [email, setEmail] = useState('');
    const [mssv, setMssv] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    // Picker States
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(new Date());

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'GENDER' | 'YEAR' | 'DATE_YEAR' | 'DATE_MONTH' | 'DATE_DAY' | null>(null);
    const [modalData, setModalData] = useState<string[]>([]);
    const [modalTitle, setModalTitle] = useState('');

    useEffect(() => {
        if (token) {
            fetchProfile();
        }
    }, [token]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${Config.API_BASE_URL}/students/my-profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await response.json();
            if (json.success) {
                const data = json.data;
                setStudentData(data);

                // Populate fields
                setFullName(data.fullName || '');
                setPhoneNumber(data.phoneNumber || '');
                setGender(data.gender || '');
                setAcademicYear(data.academicYear || '');
                setFaculty(data.faculty || '');
                setDateOfBirth(data.dateOfBirth || '');
                setBio(data.bio || '');
                setEmail(data.email || '');
                setMssv(data.mssv || '');
                setAvatarUrl(data.avatarUrl || '');

                if (data.dateOfBirth) {
                    setDate(new Date(data.dateOfBirth));
                }

                // Sync global user context with fetched avatar
                if (data.avatarUrl) {
                    updateUser({ avatarUrl: data.avatarUrl });
                }
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
        if (!studentData?.studentId) return;

        setSaving(true);
        try {
            const body = {
                fullName,
                phoneNumber,
                gender,
                academicYear,
                faculty,
                dateOfBirth,
                bio
            };

            const response = await fetch(`${Config.API_BASE_URL}/students/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const json = await response.json();
            if (response.ok && json.success) {
                Alert.alert("Success", "Profile updated successfully!", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                Alert.alert("Error", json.message || "Failed to update profile");
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

            const response = await fetch(`${Config.API_BASE_URL}/auth/me/image`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            const json = await response.json();
            if (response.ok && json.success) {
                let newAvatarUrl = '';
                if (typeof json.data === 'string' && json.data.startsWith('http')) {
                    newAvatarUrl = json.data;
                } else if (typeof json.data === 'object' && json.data.avatarUrl) {
                    newAvatarUrl = json.data.avatarUrl;
                }

                if (newAvatarUrl) {
                    setAvatarUrl(newAvatarUrl);
                    updateUser({ avatarUrl: newAvatarUrl });
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

    const [tempDate, setTempDate] = useState({ year: '', month: '', day: '' });

    const openDatePicker = () => {
        setTempDate({ year: '', month: '', day: '' });
        setModalType('DATE_YEAR');
        setModalTitle('Select Year of Birth');
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= 1950; i--) {
            years.push(`${i}`);
        }
        setModalData(years);
        setModalVisible(true);
    };

    const openGenderPicker = () => {
        setModalType('GENDER');
        setModalTitle('Select Gender');
        setModalData(['MALE', 'FEMALE', 'OTHER']);
        setModalVisible(true);
    };

    const openYearPicker = () => {
        setModalType('YEAR');
        setModalTitle('Select Academic Year');
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear - 6; i <= currentYear + 2; i++) {
            years.push(`${i}`);
        }
        setModalData(years.reverse());
        setModalVisible(true);
    };

    const handleModalSelect = (item: string) => {
        if (modalType === 'GENDER') {
            setGender(item);
            setModalVisible(false);
        } else if (modalType === 'YEAR') {
            setAcademicYear(item);
            setModalVisible(false);
        } else if (modalType === 'DATE_YEAR') {
            setTempDate(prev => ({ ...prev, year: item }));
            setModalType('DATE_MONTH');
            setModalTitle('Select Month of Birth');
            const months = Array.from({ length: 12 }, (_, i) => `${i + 1}`);
            setModalData(months);
        } else if (modalType === 'DATE_MONTH') {
            setTempDate(prev => ({ ...prev, month: item.padStart(2, '0') }));
            setModalType('DATE_DAY');
            setModalTitle('Select Day of Birth');
            // Calculate days in month
            const year = parseInt(tempDate.year || new Date().getFullYear().toString());
            const month = parseInt(item);
            const daysInMonth = new Date(year, month, 0).getDate();
            const days = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
            setModalData(days);
        } else if (modalType === 'DATE_DAY') {
            const day = item.padStart(2, '0');
            const fullDate = `${tempDate.year}-${tempDate.month}-${day}`;
            setDateOfBirth(fullDate);
            setModalVisible(false);
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
                            source={avatarUrl ? { uri: avatarUrl } : require('../assets/images/student_image.png')}
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

                    {/* Section: Personal Details */}
                    <Text style={styles.sectionTitle}>Personal Details</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Enter full name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Student ID (Read-only)</Text>
                        <TextInput
                            style={[styles.input, styles.readOnlyInput]}
                            value={mssv}
                            editable={false}
                        />
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
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            placeholder="Enter phone number"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date of Birth</Text>
                        <TouchableOpacity onPress={openDatePicker} style={styles.pickerButton}>
                            <Text style={styles.pickerText}>{dateOfBirth || 'Select Date'}</Text>
                            <Ionicons name="calendar-outline" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gender</Text>
                        <TouchableOpacity onPress={openGenderPicker} style={styles.pickerButton}>
                            <Text style={styles.pickerText}>{gender || 'Select Gender'}</Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Section: Education Details */}
                    <Text style={styles.sectionTitle}>Education Details</Text>

                    {/* Faculty Removed */}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Academic Year</Text>
                        <TouchableOpacity onPress={openYearPicker} style={styles.pickerButton}>
                            <Text style={styles.pickerText}>{academicYear || 'Select Year'}</Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Tell something about yourself..."
                            multiline
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

                    <View style={{ height: 20 }} />

                    {/* <TouchableOpacity
                        style={styles.testButton}
                        onPress={() => router.push('/test-notification' as any)}
                    >
                        <Ionicons name="notifications-outline" size={20} color="#555" style={{ marginRight: 8 }} />
                        <Text style={styles.testButtonText}>Test Notifications</Text>
                    </TouchableOpacity> */}

                    <View style={{ height: 40 }} />

                </ScrollView>
            </KeyboardAvoidingView>



            {/* Custom Selection Modal */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{modalTitle}</Text>
                        <FlatList
                            data={modalData}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => handleModalSelect(item)}
                                >
                                    <Text style={styles.modalItemText}>{item}</Text>
                                    {((modalType === 'GENDER' && gender === item) || (modalType === 'YEAR' && academicYear === item)) && (
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
    },
    testButton: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        paddingVertical: 15,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    testButtonText: {
        color: '#555',
        fontSize: 16,
        fontWeight: '600',
    }
});
