import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SendFeedbackScreen() {
    const router = useRouter();
    const [feedback, setFeedback] = useState('');

    const handleSubmit = () => {
        if (!feedback.trim()) {
            Alert.alert("Empty Feedback", "Please enter your feedback before sending.");
            return;
        }
        // Mock API call
        Alert.alert("Thank You!", "We appreciate your feedback.", [
            { text: "OK", onPress: () => router.back() }
        ]);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>SEND FEEDBACK</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    <Text style={styles.label}>Tell us what can be improved?</Text>
                    <TextInput
                        style={styles.input}
                        multiline
                        numberOfLines={8}
                        placeholder="Write your feedback here..."
                        textAlignVertical="top"
                        value={feedback}
                        onChangeText={setFeedback}
                    />

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Send Feedback</Text>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    backButton: { padding: 8, backgroundColor: '#F5F5F5', borderRadius: 50 },
    headerTitle: { fontSize: 18, fontWeight: '900', color: '#1A237E', letterSpacing: 0.5 },
    content: { padding: 20 },
    label: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20 },
    input: { backgroundColor: '#F9F9F9', borderRadius: 16, padding: 20, fontSize: 16, height: 200, borderWidth: 1, borderColor: '#eee', marginBottom: 40 },
    submitButton: { backgroundColor: '#FF455B', paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: "#FF455B", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
