import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/context/AuthContext';

export default function UpdateActivityScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { token, user } = useAuth();
    const activityId = params.id;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [image, setImage] = useState<string | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null); // To track changes
    const [activityName, setActivityName] = useState('');
    const [description, setDescription] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [deadline, setDeadline] = useState(new Date());
    const [location, setLocation] = useState('');
    const [maxParticipants, setMaxParticipants] = useState('');
    const [daysAwarded, setDaysAwarded] = useState('');
    const [requirements, setRequirements] = useState('');
    const [category, setCategory] = useState('EDUCATION_SUPPORT');

    // Date Picker State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [activeDateField, setActiveDateField] = useState<'start' | 'end' | 'deadline' | null>(null);
    const [pickerDate, setPickerDate] = useState(new Date());
    const [pickerMode, setPickerMode] = useState<'date' | 'time' | 'datetime'>('date');

    const CATEGORIES = [
        'EDUCATION_SUPPORT',
        'SOCIAL_SUPPORT',
        'COMMUNITY_SERVICE',
        'ENVIRONMENT',
        'HEALTH_CAMPAIGN',
        'EVENT_SUPPORT',
        'FUNDRAISING',
        'OTHER'
    ];
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // Fetch Activity Details
    useEffect(() => {
        const fetchDetails = async () => {
            if (!activityId || !token) return;

            try {
                const response = await fetch(`https://marg-astonishing-matthias.ngrok-free.dev/api/v1/activities/${activityId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await response.json();

                if (json.success && json.data) {
                    const data = json.data;
                    setActivityName(data.name || '');
                    setDescription(data.description || '');
                    setShortDescription(data.shortDescription || '');
                    setLocation(data.address || '');
                    setMaxParticipants(data.maxParticipants ? data.maxParticipants.toString() : '');
                    setRequirements(data.requirements || '');
                    setCategory(data.category || 'OTHER');
                    setDaysAwarded(data.benefitsCtxh ? data.benefitsCtxh.toString() : '');

                    if (data.startDateTime) setStartDate(new Date(data.startDateTime));
                    if (data.endDateTime) setEndDate(new Date(data.endDateTime));
                    if (data.registrationDeadline) setDeadline(new Date(data.registrationDeadline));
                    if (data.imageUrl && data.imageUrl.startsWith('http')) {
                        setImage(data.imageUrl);
                        setOriginalImage(data.imageUrl);
                    }
                } else {
                    Alert.alert("Error", "Could not fetch activity details");
                }
            } catch (error) {
                console.error("Fetch Error:", error);
                Alert.alert("Error", "Failed to load activity details");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [activityId, token]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleUpdate = async () => {
        if (!activityName || !description || !location || !maxParticipants) {
            Alert.alert('Missing Info', 'Please fill in all required fields.');
            return;
        }

        // --- VALIDATION LOGIC ---
        const now = new Date();

        // 1. Registration Deadline must be in the future
        if (deadline <= now) {
            Alert.alert("Invalid Date", "Registration Deadline must be in the future.");
            return;
        }

        // 2. Start Date must be after Registration Deadline activity should start after reg closes
        if (startDate <= deadline) {
            Alert.alert("Invalid Date", "Start Date must be after Registration Deadline.");
            return;
        }

        // 3. End Date must be after Start Date
        if (endDate <= startDate) {
            Alert.alert("Invalid Date", "End Date must be after Start Date.");
            return;
        }

        setSubmitting(true);
        try {
            const hasNewImage = image && image !== originalImage;

            const activityData = {
                name: activityName,
                shortDescription: shortDescription || description.substring(0, 50),
                description: description,
                category: category,
                startDateTime: startDate.toISOString(),
                endDateTime: endDate.toISOString(),
                registrationDeadline: deadline.toISOString(),
                address: location,
                maxParticipants: parseInt(maxParticipants),
                requirements: requirements,
                theNumberOfCtxhDay: parseFloat(daysAwarded) || 0,
            };

            const formData = new FormData();
            formData.append('data', JSON.stringify(activityData));

            if (hasNewImage) {
                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image`;

                // @ts-ignore
                formData.append('image', {
                    uri: image,
                    name: filename,
                    type: type,
                });
            }

            const response = await fetch(`https://marg-astonishing-matthias.ngrok-free.dev/api/v1/activities/${activityId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Content-Type header left empty for multipart boundary
                },
                body: formData
            });

            const json = await response.json();
            if (response.ok && (json.success || json.code === 0)) {
                Alert.alert("Success", "Activity updated successfully!", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                console.error("Update Failed:", json);
                Alert.alert("Update Failed", json.message || "Unknown error");
            }

        } catch (error) {
            console.error("Update Error:", error);
            Alert.alert("Error", "Network error during update");
        } finally {
            setSubmitting(false);
        }
    };

    const openDatePicker = (field: 'start' | 'end' | 'deadline') => {
        setActiveDateField(field);

        let currentDate = new Date();
        if (field === 'start') currentDate = startDate;
        if (field === 'end') currentDate = endDate;
        if (field === 'deadline') currentDate = deadline;

        setPickerDate(currentDate);

        if (Platform.OS === 'android') {
            setPickerMode('date');
            setShowDatePicker(true);
        } else {
            setPickerMode('datetime');
            setShowDatePicker(true);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (event.type === 'dismissed') {
            setShowDatePicker(false);
            return;
        }

        const currentDate = selectedDate || pickerDate;
        setPickerDate(currentDate);

        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            if (pickerMode === 'date') {
                setPickerMode('time');
                setTimeout(() => setShowDatePicker(true), 100);
            } else {
                if (activeDateField === 'start') setStartDate(currentDate);
                if (activeDateField === 'end') setEndDate(currentDate);
                if (activeDateField === 'deadline') setDeadline(currentDate);
            }
        }
    };

    const confirmIOSDate = () => {
        setShowDatePicker(false);
        if (activeDateField === 'start') setStartDate(pickerDate);
        if (activeDateField === 'end') setEndDate(pickerDate);
        if (activeDateField === 'deadline') setDeadline(pickerDate);
    };

    const formatDate = (d: Date) => {
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#FF4058" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>UPDATE ACTIVITY</Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* Image Upload */}
                    <TouchableOpacity style={styles.uploadContainer} onPress={pickImage}>
                        <Image
                            source={image ? { uri: image } : require('../assets/images/alternative.png')}
                            style={styles.uploadedImage}
                        />
                        <View style={styles.overlayContainer}>
                            <Ionicons name="camera" size={24} color="#fff" />
                            <Text style={styles.uploadTextOverlay}>CHANGE IMAGE</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Category Selection */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Category</Text>
                        <TouchableOpacity style={styles.inputWithIcon} onPress={() => setShowCategoryModal(true)}>
                            <Text style={styles.inputText}>{category.replace('_', ' ')}</Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Activity Name</Text>
                        <TextInput style={styles.input} value={activityName} onChangeText={setActivityName} />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Short Description (max 50 chars)</Text>
                        <TextInput style={styles.input} value={shortDescription} onChangeText={setShortDescription} maxLength={50} />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Full Description</Text>
                        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Location</Text>
                        <TextInput style={styles.input} value={location} onChangeText={setLocation} />
                    </View>

                    <View style={styles.rowContainer}>
                        <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>Max Participants</Text>
                            <TextInput style={styles.input} value={maxParticipants} onChangeText={setMaxParticipants} keyboardType="numeric" />
                        </View>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Days Awarded</Text>
                            <TextInput style={styles.input} value={daysAwarded} onChangeText={setDaysAwarded} keyboardType="numeric" />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Requirements</Text>
                        <TextInput style={styles.input} value={requirements} onChangeText={setRequirements} />
                    </View>

                    {/* Dates */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Start Date & Time</Text>
                        <TouchableOpacity style={styles.inputWithIcon} onPress={() => openDatePicker('start')}>
                            <Text style={styles.inputText}>{formatDate(startDate)}</Text>
                            <Ionicons name="calendar-outline" size={20} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>End Date & Time</Text>
                        <TouchableOpacity style={styles.inputWithIcon} onPress={() => openDatePicker('end')}>
                            <Text style={styles.inputText}>{formatDate(endDate)}</Text>
                            <Ionicons name="calendar-outline" size={20} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Registration Deadline</Text>
                        <TouchableOpacity style={styles.inputWithIcon} onPress={() => openDatePicker('deadline')}>
                            <Text style={[styles.inputText, { color: '#D32F2F' }]}>{formatDate(deadline)}</Text>
                            <Ionicons name="warning-outline" size={20} color="#D32F2F" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.createButton, submitting && { opacity: 0.7 }]}
                        onPress={handleUpdate}
                        disabled={submitting}
                    >
                        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.createButtonText}>SAVE CHANGES</Text>}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Category Modal */}
            <Modal visible={showCategoryModal} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowCategoryModal(false)}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity key={cat} style={styles.modalItem} onPress={() => { setCategory(cat); setShowCategoryModal(false); }}>
                                    <Text style={[styles.modalItemText, category === cat && { color: '#FF4058', fontWeight: 'bold' }]}>{cat.replace('_', ' ')}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>


            {/* DateTime Picker */}
            {/* Date Picker Implementation */}
            {Platform.OS === 'ios' ? (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={showDatePicker}
                    onRequestClose={() => setShowDatePicker(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.datePickerModalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Text style={styles.modalCancel}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={confirmIOSDate}>
                                    <Text style={styles.modalDone}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={pickerDate}
                                mode="datetime"
                                display="spinner"
                                onChange={onDateChange}
                                themeVariant="light"
                                textColor="#000"
                            />
                        </View>
                    </View>
                </Modal>
            ) : (
                showDatePicker && (
                    <DateTimePicker
                        value={pickerDate}
                        mode={pickerMode as any}
                        display="default"
                        onChange={onDateChange}
                        is24Hour={true}
                    />
                )
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, marginBottom: 10 },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    uploadContainer: { height: 180, backgroundColor: '#f0f0f0', borderRadius: 12, marginBottom: 20, overflow: 'hidden', position: 'relative' },
    uploadedImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    overlayContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    uploadTextOverlay: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 12 },
    formGroup: { marginBottom: 15 },
    rowContainer: { flexDirection: 'row' },
    label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, backgroundColor: '#fff' },
    inputWithIcon: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12 },
    inputText: { fontSize: 14, color: '#333' },
    textArea: { height: 100, textAlignVertical: 'top' },
    createButton: { backgroundColor: '#FF4058', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 40 },
    createButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 40 },
    modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, maxHeight: 400 },
    modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalItemText: { fontSize: 16 },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    datePickerModalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalCancel: {
        color: '#FF4058',
        fontSize: 16,
    },
    modalDone: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
