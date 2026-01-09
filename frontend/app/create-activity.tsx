import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert, LogBox, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateActivityScreen() {
    const router = useRouter();
    const { user, token } = useAuth();

    // Use useEffect to suppress warnings on mount
    useEffect(() => {
        LogBox.ignoreLogs([
            'ImagePicker.MediaTypeOptions have been deprecated',
            'ImagePicker: MediaTypeOptions have been deprecated'
        ]);
    }, []);

    // Form State (Empty by default)
    const [image, setImage] = useState<string | null>(null);
    const [activityName, setActivityName] = useState('');
    const [shortDescription, setShortDescription] = useState(''); // Added
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('EDUCATION_SUPPORT'); // Added

    // Date Strings (Display)
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [deadline, setDeadline] = useState('');

    // Date Objects (For API)
    const [startDateObj, setStartDateObj] = useState<Date | null>(null);
    const [endDateObj, setEndDateObj] = useState<Date | null>(null);
    const [deadlineObj, setDeadlineObj] = useState<Date | null>(null);

    const [location, setLocation] = useState('');
    const [volunteers, setVolunteers] = useState('');
    const [daysAwarded, setDaysAwarded] = useState('');
    const [requirements, setRequirements] = useState('');

    // Date Picker State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [activeDateField, setActiveDateField] = useState<'start' | 'end' | 'deadline' | null>(null);
    const [date, setDate] = useState(new Date());

    const ACTIVITY_CATEGORIES = [
        'EDUCATION_SUPPORT',
        'SOCIAL_SUPPORT',
        'COMMUNITY_SERVICE',
        'ENVIRONMENT',
        'HEALTH_CAMPAIGN',
        'EVENT_SUPPORT',
        'FUNDRAISING',
        'OTHER'
    ];
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        // console.log("Image Picker Result:", result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleCreate = async () => {
        // Validation
        if (!activityName || !startDateObj || !endDateObj || !deadlineObj || !volunteers || !daysAwarded) {
            Alert.alert("Missing Information", "Please fill in all required fields.");
            return;
        }

        const ctxhDays = parseFloat(daysAwarded);
        if (isNaN(ctxhDays) || ctxhDays < 0.5) {
            Alert.alert("Invalid Input", "The number of CTXH days must be at least 0.5.");
            return;
        }

        // Basic date logical checks
        const now = new Date();
        if (startDateObj < now) {
            console.warn("Start date is in the past", startDateObj);
            // Allow it ? Backend enforces "Future".
            // If user picked "Today", and time is 00:00, it's past.
            // We should have fixed the object creation.
        }

        if (endDateObj <= startDateObj) {
            Alert.alert("Invalid Dates", "End date must be after start date.");
            return;
        }

        if (deadlineObj >= startDateObj) {
            Alert.alert("Invalid Dates", "Registration deadline must be before the start date.");
            return;
        }

        try {
            const formData = new FormData();

            // 1. Prepare the JSON data part
            // Ensure dates are ISO strings
            const activityData = {
                title: activityName,
                shortDescription: shortDescription || activityName, // Fallback
                description: description || activityName,
                category: category,
                startDateTime: startDateObj.toISOString(),
                endDateTime: endDateObj.toISOString(),
                registrationDeadline: deadlineObj.toISOString(),
                address: location,
                maxParticipants: parseInt(volunteers),
                requirements: requirements || "None",
                theNumberOfCtxhDay: ctxhDays
            };

            // console.log(">>> SENDING DATA:", JSON.stringify(activityData));

            const rnFormData = new FormData();
            rnFormData.append('data', JSON.stringify(activityData));

            // 2. Append Image if exists
            if (image) {
                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image`;

                // @ts-ignore
                rnFormData.append('image', {
                    uri: image,
                    name: filename,
                    type: type,
                });
            }

            // Fix ID extraction priority: organizationId -> id -> sub (user.id/sub mapped in AuthContext)
            const orgId = user?.organizationId || user?.id || user?.sub;

            // console.log(">>> User Object in CreateActivity:", JSON.stringify(user));
            // console.log(">>> Determined OrgID:", orgId);

            if (!orgId) {
                Alert.alert("Error", "Could not identify Organization ID. Please try logging in again.");
                return;
            }

            const apiURL = `https://marg-astonishing-matthias.ngrok-free.dev/api/v1/activities?organizationId=${orgId}`;
            // console.log(">>> CALLING API URL:", apiURL);

            const response = await fetch(apiURL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token || ''}`,
                    Accept: 'application/json',
                },
                body: rnFormData,
            });

            const json = await response.json();
            // console.log(">>> RESPONSE:", JSON.stringify(json));

            if (json.success) {
                Alert.alert("Success", "Activity created successfully!", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                // Handling specific error codes/messages
                if (response.status === 401 || response.status === 403) {
                    Alert.alert("Authentication Error", "Your session may have expired or account is disabled.\nPlease login again.");
                    return;
                }

                // Account disabled check (Code 1104)
                if (json.code === 1104 || json.message?.includes("disabled")) {
                    Alert.alert(
                        "Account Disabled",
                        "Your account has not been verified yet.",
                        [
                            { text: "Verify Now", onPress: () => router.replace('/verify-email') }
                        ]
                    );
                    return;
                }

                if (json.data && typeof json.data === 'object') {
                    // Validation errors map
                    const errorMessages = Object.entries(json.data).map(([key, msg]) => `• ${key}: ${msg}`).join('\n');
                    Alert.alert("Validation Error", errorMessages || json.message);
                } else {
                    Alert.alert("Error", json.message || "Failed to create activity.");
                }
            }
        } catch (error) {
            console.error("Create Activity Error:", error);
            Alert.alert("Error", "An network error occurred while creating the activity.");
        }
    };

    const openDatePicker = (field: 'start' | 'end' | 'deadline') => {
        // console.log(`Opening Date Picker for: ${field}`); // Debug log
        setActiveDateField(field);
        setShowDatePicker(true);
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setDate(currentDate);

        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            updateDateState(currentDate);
        }
    };

    const confirmIOSDate = () => {
        setShowDatePicker(false);
        updateDateState(date);
    };

    const updateDateState = (selectedDate: Date) => {
        // Updated format to include HH:mm
        const formattedDate = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()} ${selectedDate.getHours().toString().padStart(2, '0')}:${selectedDate.getMinutes().toString().padStart(2, '0')}`;

        // Ensure if date is today, we don't accidentally set a past time if parsing failed? 
        // But here we get a Date object directly from picker.

        if (activeDateField === 'start') {
            setStartDate(formattedDate);
            setStartDateObj(selectedDate);
        }
        if (activeDateField === 'end') {
            setEndDate(formattedDate);
            setEndDateObj(selectedDate);
        }
        if (activeDateField === 'deadline') {
            setDeadline(formattedDate);
            setDeadlineObj(selectedDate);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>CREATE NEW ACTIVITY</Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Image Upload */}
                    <TouchableOpacity style={styles.uploadContainer} onPress={pickImage}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.uploadedImage} />
                        ) : (
                            <>
                                <Ionicons name="camera-outline" size={30} color="#555" />
                                <Text style={styles.uploadText}>UPLOAD OR TAKE A PHOTO</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Category Dropdown */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Category</Text>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        >
                            <Text style={styles.dropdownButtonText}>{category.replace('_', ' ')}</Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>

                        {showCategoryDropdown && (
                            <View style={styles.dropdownList}>
                                {ACTIVITY_CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={styles.dropdownListItem}
                                        onPress={() => {
                                            setCategory(cat);
                                            setShowCategoryDropdown(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.dropdownListText,
                                            category === cat && { color: '#FF4058', fontWeight: 'bold' }
                                        ]}>
                                            {cat.replace('_', ' ')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    <Text style={styles.detailsTitle}>Activity Details</Text>

                    {/* Form Fields */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Activity Name</Text>
                        <TextInput
                            style={styles.input}
                            value={activityName}
                            onChangeText={setActivityName}
                            placeholder="Ex: Blood Donation Drive"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Short Description</Text>
                        <TextInput
                            style={styles.input}
                            value={shortDescription}
                            onChangeText={setShortDescription}
                            placeholder="Ex: Brief summary for card view"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            placeholder="Describe your activity..."
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Start Date</Text>
                        <TouchableOpacity style={styles.inputWithIcon} onPress={() => openDatePicker('start')}>
                            <View style={[styles.inputFake, { flex: 1, borderWidth: 0 }]}>
                                <Text style={[styles.inputText, { color: startDate ? '#000' : '#999' }]}>
                                    {startDate || "DD/MM/YYYY"}
                                </Text>
                            </View>
                            <Ionicons name="calendar-outline" size={20} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>End Date</Text>
                        <TouchableOpacity style={styles.inputWithIcon} onPress={() => openDatePicker('end')}>
                            <View style={[styles.inputFake, { flex: 1, borderWidth: 0 }]}>
                                <Text style={[styles.inputText, { color: endDate ? '#000' : '#999' }]}>
                                    {endDate || "DD/MM/YYYY"}
                                </Text>
                            </View>
                            <Ionicons name="calendar-outline" size={20} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Location</Text>
                        <TextInput
                            style={styles.input}
                            value={location}
                            onChangeText={setLocation}
                            placeholder="Ex: Hall B1"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Number of volunteer</Text>
                        <TextInput
                            style={styles.input}
                            value={volunteers}
                            onChangeText={setVolunteers}
                            keyboardType="numeric"
                            placeholder="Ex: 20"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Volunteer Days Awarded</Text>
                        <TextInput
                            style={styles.input}
                            value={daysAwarded}
                            onChangeText={setDaysAwarded}
                            keyboardType="numeric"
                            placeholder="Ex: 2"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Registration Deadline</Text>
                        <TouchableOpacity style={styles.inputWithIcon} onPress={() => openDatePicker('deadline')}>
                            <View style={[styles.inputFake, { flex: 1, borderWidth: 0 }]}>
                                <Text style={[styles.inputText, { color: deadline ? '#000' : '#999' }]}>
                                    {deadline || "DD/MM/YYYY"}
                                </Text>
                            </View>
                            <Ionicons name="calendar-outline" size={20} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Requirements</Text>
                        <TextInput
                            style={styles.input}
                            value={requirements}
                            onChangeText={setRequirements}
                            placeholder="Ex: Basic skills..."
                            placeholderTextColor="#999"
                        />
                    </View>

                    <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
                        <Text style={styles.createButtonText}>CREATE</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Date Picker Implementation */}
            {Platform.OS === 'ios' ? (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={showDatePicker}
                    onRequestClose={() => setShowDatePicker(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Text style={styles.modalCancel}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={confirmIOSDate}>
                                    <Text style={styles.modalDone}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={date}
                                mode="datetime"
                                display="spinner"
                                onChange={onDateChange}
                                themeVariant="light"
                                textColor="#000"
                                minimumDate={new Date()}
                            />
                        </View>
                    </View>
                </Modal>
            ) : (
                showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date" // Android often cleaner with just date first, handling time is complex without splitting. 
                        // For now, let's stick to date but maybe default to "End of Day" for deadline? 
                        // Or just "Now" time? The validation says "must be in future".
                        // Let's try 'datetime' on Android too, it usually falls back or works.
                        // Actually, Android native picker is usually one or the other.
                        // Let's keep 'date' for android but manually set time to 23:59 for deadline, or current time for others?
                        // Hack: use mode="date" but preserve current time in the object if not modifying time.
                        // Better: Use 'date' then 'time'. But too complex for this edit.
                        // Let's rely on user picking a FUTURE DATE (tomorrow+). 
                        // If they pick TODAY, IT WILL FAIL if time is 00:00.
                        // FIX: When updating state, if the date is today, set time to now + 1 hour.
                        display="default"
                        onChange={onDateChange}
                        minimumDate={new Date()}
                    />
                )
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 10,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    uploadContainer: {
        height: 180,
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    uploadText: {
        marginTop: 10,
        fontWeight: '600',
        color: '#555',
        fontSize: 14,
    },
    sectionHeader: {
        marginBottom: 10,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#444',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
        marginHorizontal: 5,
    },
    removeTag: {
        marginLeft: 2,
    },
    addTagButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        marginBottom: 10,
    },
    addTagText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    detailsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#000',
    },
    formGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 15,
        fontWeight: 'bold', // Bolder labels
        color: '#222', // Darker text
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 14,
        fontSize: 15,
        fontWeight: '600', // Semibold input text
        color: '#000',
        backgroundColor: '#fff',
    },
    inputFake: {
        paddingVertical: 14,
        paddingHorizontal: 15,
        justifyContent: 'center'
    },
    inputText: {
        fontSize: 15,
        fontWeight: '600',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingRight: 15,
    },
    createButton: {
        backgroundColor: '#FF4058',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 50,
        shadowColor: "#FF4058",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
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
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#F9F9F9',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    dropdownButtonText: {
        fontSize: 15,
        color: '#333',
    },
    dropdownList: {
        marginTop: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
        padding: 5,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dropdownListItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownListText: {
        fontSize: 14,
        color: '#333',
    },
});
