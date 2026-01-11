import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function OtpVerificationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const email = params.email as string;
    const [isLoading, setIsLoading] = useState(false);

    // OTP State (6 digits)
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef<Array<TextInput | null>>([]);

    // Timer State
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputs.current[index + 1]?.focus();
        }
        // Auto-focus prev input on delete (optional, handled by onKeyPress usually)
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleResend = () => {
        setTimer(60);
        setCanResend(false);
        // Logic to resend code
        console.log("Resending code...");
    };



    const handleConfirm = async () => {
        const otpString = otp.join('');
        if (otpString.length < 6) {
            alert("Please enter the full 6-digit code.");
            return;
        }

        if (!email) {
            alert("Error: Email missing. Please start over.");
            router.replace('/login/forgot-password');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('https://marg-astonishing-matthias.ngrok-free.dev/api/v1/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    otpCode: otpString
                }),
            });

            const json = await response.json();

            if (response.ok && json.success) {
                // Success
                const token = json.data?.resetPasswordToken;
                // Navigate to Reset Password
                router.push({
                    pathname: '/login/reset-password',
                    params: {
                        email: email,
                        resetToken: token
                    }
                });
            } else {
                alert(json.message || "Invalid OTP code.");
            }
        } catch (error) {
            console.error("Verify OTP Error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
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
                <Text style={styles.title}>Verification{'\n'}Code</Text>

                <Text style={styles.instruction}>
                    We have sent the verification code to your email address
                </Text>

                {/* OTP Inputs */}
                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => { inputs.current[index] = ref; }}
                            style={[
                                styles.otpInput,
                                digit ? styles.otpInputFilled : null
                            ]}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                {/* Confirm Button */}
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>

                {/* Dropdown / Resend */}
                <View style={styles.resendContainer}>
                    {canResend ? (
                        <TouchableOpacity onPress={handleResend}>
                            <Text style={styles.resendLink}>Resend Now</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.resendText}>
                            Resend code in <Text style={styles.timerText}>{formatTime(timer)}</Text>
                        </Text>
                    )}
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 25,
        alignItems: 'center', // Center content for OTP
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
        lineHeight: 44,
        alignSelf: 'flex-start',
    },
    instruction: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
        alignSelf: 'flex-start',
        lineHeight: 24,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 40,
    },
    otpInput: {
        width: 45, // Adjusted for 6 digits
        height: 55,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#F3F3F3',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    otpInputFilled: {
        borderColor: '#FF4058',
        backgroundColor: '#fff',
    },
    confirmButton: {
        width: '100%',
        height: 55,
        backgroundColor: '#FF4058',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#FF4058',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resendContainer: {
        alignItems: 'center',
    },
    resendText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    timerText: {
        color: '#FF4058',
        fontWeight: 'bold',
    },
    resendLink: {
        color: '#FF4058',
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 5,
    }
});
