import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmailScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        let timer: any;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleResendEmail = async () => {
        if (!user?.email) {
            Alert.alert("Error", "User email not found. Please login again.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`https://marg-astonishing-matthias.ngrok-free.dev/api/v1/auth/resend-verify-email?email=${encodeURIComponent(user.email)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const json = await response.json();

            if (json.success || json.code === 200) {
                Alert.alert("Success", "Verification email has been resent!\nPlease check your inbox.");
                setCountdown(60); // 60 seconds cooldown
            } else {
                Alert.alert("Error", json.message || "Failed to resend email.");
            }
        } catch (error) {
            console.error("Resend Email Error:", error);
            Alert.alert("Error", "Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.replace('/login');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="mail-unread-outline" size={80} color="#FF4058" />
                </View>

                <Text style={styles.title}>Account Disabled</Text>

                <Text style={styles.description}>
                    Your account has not been activated yet. Please check your email inbox for the verification link.
                </Text>

                {user?.email && (
                    <Text style={styles.emailText}>
                        Sent to: <Text style={{ fontWeight: 'bold' }}>{user.email}</Text>
                    </Text>
                )}

                <TouchableOpacity
                    style={[styles.resendButton, (countdown > 0 || isLoading) && styles.disabledButton]}
                    onPress={handleResendEmail}
                    disabled={countdown > 0 || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.resendButtonText}>
                            {countdown > 0 ? `Resend available in ${countdown}s` : "Resend Verification Email"}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Back to Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        paddingHorizontal: 25,
    },
    content: {
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFF0F2', // Light pink
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
        lineHeight: 24,
    },
    emailText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 40,
        textAlign: 'center',
    },
    resendButton: {
        width: '100%',
        height: 55,
        backgroundColor: '#FF4058',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#FF4058',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    disabledButton: {
        backgroundColor: '#FFB6C1', // Lighter red/pink
        shadowOpacity: 0,
        elevation: 0,
    },
    resendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        padding: 10,
    },
    backButtonText: {
        color: '#888',
        fontSize: 14,
    },
});
