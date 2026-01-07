import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert, LogBox, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateActivityScreen() {
    const router = useRouter();

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
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [location, setLocation] = useState('');
    const [volunteers, setVolunteers] = useState('');
    const [daysAwarded, setDaysAwarded] = useState('');
    const [deadline, setDeadline] = useState('');
    const [requirements, setRequirements] = useState('');

    // Date Picker State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [activeDateField, setActiveDateField] = useState<'start' | 'end' | 'deadline' | null>(null);
    const [date, setDate] = useState(new Date());

    // Tag State (Mock)
    const [tags, setTags] = useState([
        { id: 1, label: 'Education', color: '#E0F7FA', textColor: '#00BCD4', icon: 'school-outline' },
        { id: 2, label: 'Active', color: '#E8F5E9', textColor: '#4CAF50', icon: 'checkmark-circle-outline' }
    ]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log("Image Picker Result:", result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleCreate = () => {
        // Logic to submit form
        if (!activityName || !startDate) {
            Alert.alert("Missing Information", "Please fill in all required fields.");
            return;
        }
        console.log('Activity Created');
        router.back();
    };

    const openDatePicker = (field: 'start' | 'end' | 'deadline') => {
        console.log(`Opening Date Picker for: ${field}`); // Debug log
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
        const formattedDate = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;

        if (activeDateField === 'start') setStartDate(formattedDate);
        if (activeDateField === 'end') setEndDate(formattedDate);
        if (activeDateField === 'deadline') setDeadline(formattedDate);
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

                    {/* Tags */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>TAGS</Text>
                        <View style={styles.tagsContainer}>
                            {tags.map(tag => (
                                <View key={tag.id} style={[styles.tag, { backgroundColor: tag.color }]}>
                                    <Ionicons name={tag.icon as any} size={14} color={tag.textColor} />
                                    <Text style={[styles.tagText, { color: tag.textColor }]}>{tag.label}</Text>
                                    <TouchableOpacity style={styles.removeTag}>
                                        <Ionicons name="close" size={10} color={tag.textColor} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity style={styles.addTagButton}>
                                <Ionicons name="add" size={20} color="#333" />
                                <Text style={styles.addTagText}>Add</Text>
                            </TouchableOpacity>
                        </View>
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
                                mode="date"
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
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
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
});
