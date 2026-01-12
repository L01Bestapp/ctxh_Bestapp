import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function GoogleStudentIdScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [studentId, setStudentId] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useAuth(); // Get auth token

    const handleComplete = async () => {
        if (!studentId.trim()) {
            Alert.alert("Required", "Please enter your Student ID.");
            return;
        }

        setLoading(true);
        try {
            // Need to determine endpoint. Assuming update-profile accepts partial updates.
            // If it mimics student-profile-settings, it put to /students/update-profile
            const response = await fetch('https://marg-astonishing-matthias.ngrok-free.dev/api/v1/students/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    mssv: studentId.trim()
                })
            });

            const json = await response.json();

            if (json.success) {
                Alert.alert("Success", "Profile completed!", [
                    { text: "OK", onPress: () => router.replace('/(tabs-student)/home') }
                ]);
            } else {
                Alert.alert("Error", json.message || "Could not update Student ID.");
            }

        } catch (error) {
            console.error("Update Error:", error);
            Alert.alert("Error", "Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.container,
                    { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <StatusBar style="dark" />

                {/* Header */}
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>FINISH SIGNING UP</Text>
                    <View style={styles.titleUnderline} />
                </View>

                <Text style={styles.subtitle}>
                    Please enter your Student ID (MSSV) to complete your registration.
                </Text>

                {/* Student ID Input */}
                <View style={styles.inputContainer}>
                    <Ionicons name="card-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Student ID (MSSV)"
                        placeholderTextColor="#999"
                        value={studentId}
                        onChangeText={setStudentId}
                        keyboardType="numeric"
                        autoFocus
                    />
                </View>

                {/* Complete Button */}
                <TouchableOpacity style={styles.completeButton} onPress={handleComplete} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.completeButtonText}>Complete Signup</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 25,
    },
    headerContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 10,
        textAlign: 'center',
    },
    titleUnderline: {
        width: 60,
        height: 6,
        backgroundColor: '#FF4058',
        borderRadius: 3,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F3F3',
        borderRadius: 12,
        height: 55,
        marginBottom: 30,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#333',
        fontSize: 16,
    },
    completeButton: {
        width: '100%',
        height: 55,
        backgroundColor: '#FF4058',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF4058',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    completeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
