import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Config } from '@/constants/Config';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const { email, resetToken } = params;
    const [isLoading, setIsLoading] = useState(false);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const rules = [
        { id: 1, label: 'At least 6 characters', valid: password.length >= 6 },
        { id: 2, label: 'At least one letter', valid: /[a-zA-Z]/.test(password) },
        { id: 3, label: 'At least one number', valid: /[0-9]/.test(password) },
    ];

    const allRulesMet = rules.every(r => r.valid);
    const passwordsMatch = password === confirmPassword && password !== '';
    const isFormValid = allRulesMet && passwordsMatch;



    const handleResetPassword = async () => {
        if (!isFormValid) return;

        if (!resetToken) {
            alert("Error: Missing reset token. Please try again from the beginning.");
            router.replace('/login/forgot-password');
            return;
        }

        setIsLoading(true);
        try {
            // Updated to match API Spec
            const response = await fetch(`${Config.API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: resetToken,
                    newPassword: password,
                    confirmNewPassword: confirmPassword
                }),
            });

            const json = await response.json();

            if (response.ok && json.success) {
                alert(json.message || "Password reset successfully!");
                router.replace('/login');
            } else {
                alert(json.message || "Failed to reset password.");
            }
        } catch (error) {
            console.error("Reset Password Error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
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
                <Text style={styles.title}>Reset{'\n'}Password</Text>

                {/* New Password */}
                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="New Password"
                        placeholderTextColor="#999"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Password Rules Checklist */}
                <View style={styles.rulesContainer}>
                    {rules.map((rule) => (
                        <View key={rule.id} style={styles.ruleItem}>
                            <Ionicons
                                name={rule.valid ? "checkmark-circle" : "close-circle"}
                                size={18}
                                color={rule.valid ? "#4CAF50" : "#FF4058"}
                            />
                            <Text style={[
                                styles.ruleText,
                                { color: rule.valid ? "#4CAF50" : "#666" }
                            ]}>
                                {rule.label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Confirm New Password */}
                <View style={[styles.inputContainer, { marginTop: 20 }]}>
                    <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm New Password"
                        placeholderTextColor="#999"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                        <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Password Match Indicator */}
                {confirmPassword.length > 0 && (
                    <View style={[styles.ruleItem, { marginTop: 5, marginLeft: 5 }]}>
                        <Ionicons
                            name={passwordsMatch ? "checkmark-circle" : "close-circle"}
                            size={18}
                            color={passwordsMatch ? "#4CAF50" : "#FF4058"}
                        />
                        <Text style={[
                            styles.ruleText,
                            { color: passwordsMatch ? "#4CAF50" : "#FF4058" }
                        ]}>
                            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                        </Text>
                    </View>
                )}

                {/* Reset Button */}
                <TouchableOpacity
                    style={[styles.resetButton, !isFormValid && styles.resetButtonDisabled]}
                    onPress={handleResetPassword}
                    disabled={!isFormValid}
                >
                    <Text style={styles.resetButtonText}>Reset Password</Text>
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
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 30, // Reduced slightly
        lineHeight: 44,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F3F3', // Light gray background
        borderRadius: 12,
        height: 55,
        // marginBottom: 15, // Removed as rulesContainer will follow
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
    eyeIcon: {
        padding: 5,
    },
    rulesContainer: {
        marginTop: 15,
        marginBottom: 5,
    },
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ruleText: {
        marginLeft: 8,
        fontSize: 14,
    },
    resetButton: {
        width: '100%',
        height: 55,
        backgroundColor: '#FF4058',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        shadowColor: '#FF4058',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    resetButtonDisabled: {
        backgroundColor: '#FFB3B3', // Lighter red for disabled state
        shadowOpacity: 0,
        elevation: 0,
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
