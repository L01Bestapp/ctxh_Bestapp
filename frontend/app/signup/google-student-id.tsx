import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function GoogleStudentIdScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [studentId, setStudentId] = useState('');

    const handleComplete = () => {
        if (!studentId.trim()) {
            // Simple validation
            return;
        }
        // In a real app, you would update the user's profile with this ID here
        console.log("Updated Student ID for Google Account:", studentId);
        router.replace('/(tabs-student)/home');
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
                <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                    <Text style={styles.completeButtonText}>Complete Signup</Text>
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
