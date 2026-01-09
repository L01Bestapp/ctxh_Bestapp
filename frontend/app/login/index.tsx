import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GoogleSignIn from '@/components/GoogleSignIn';

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth(); // Use Auth Context

    const handleLogin = async () => {
        // Basic empty check
        if (!username || !password) {
            Alert.alert("Missing Information", "Please enter both Email and Password.");
            return;
        }

        // Email format check (bypass for admin)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (username.toLowerCase() !== 'admin' && !emailRegex.test(username)) {
            Alert.alert("Invalid Input", "Please enter a valid email address.");
            return;
        }

        // ... existing code ...



        /*
        // Optional: Password length check (if you want to catch simple typos before sending)
        if (password.length < 1) { 
             Alert.alert("Invalid Input", "Password cannot be empty.");
             return;
        }
        */

        try {
            const payload = {
                email: username,
                password: password
            };

            // console.log("DEBUG: Login Payload:", JSON.stringify(payload));

            // Use generic auth endpoint
            const response = await fetch('https://marg-astonishing-matthias.ngrok-free.dev/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const json = await response.json();
            // console.log("DEBUG: Login Response:", JSON.stringify(json));

            if (json.success && json.data && json.data.accessToken) {
                // Save token to context (decoded user data will be set there)
                // Pass the ENTIRE data object (or relevant parts) as the second argument 'user'
                // Pass the ENTIRE data object including EMAIL (username) to helper
                // console.log(">>> LOGIN SUCCESS. User Data:", JSON.stringify(json.data));
                await login(json.data.accessToken, { ...json.data, email: username });

                // Assuming role is extracted in Context.
                // For now, simple fallback navigation logic based on input if token doesn't have role
                // But ideally we redirect based on user.role from context after login
                // Since `login` is async and updates state, we might need to wait or rely on check.

                // For immediate UX, let's infer simple redirect or check response role if available
                // Use the returned role for navigation
                const role = json.data.role; // "STUDENT" | "ORGANIZATION" | "ADMIN"

                // Post-login check for account status
                try {
                    const checkResponse = await fetch('https://marg-astonishing-matthias.ngrok-free.dev/api/v1/students', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${json.data.accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    const checkJson = await checkResponse.json();

                    if (checkJson.code === 1104 || (checkJson.message && checkJson.message.toLowerCase().includes("account has been disabled"))) {
                        // console.log(">>> ACCOUNT DISABLED DETECTED. Redirecting to Verify Email.");
                        router.replace('/verify-email');
                        return; // Stop further navigation
                    }
                } catch (checkError) {
                    console.error("Post-login status check failed:", checkError);
                }

                if (role === 'ORGANIZATION') {
                    router.replace('/(tabs-org)/home');
                } else if (role === 'STUDENT') {
                    router.replace('/(tabs-student)/home');
                } else if (role === 'ADMIN') {
                    router.replace('/admin/dashboard' as any);
                } else {
                    // Fallback or unknown role
                    Alert.alert("Login Success", `Welcome! Role: ${role}`);
                    router.replace('/(tabs-student)/home');
                }

            } else {
                Alert.alert("Login Failed", json.message || "Invalid credentials.");
            }

        } catch (error) {
            console.error("Login Error:", error);
            Alert.alert("Error", "Network error. Please try again.");
        }
    };

    const handleSignUp = () => {
        router.push('/signup/role-selection');
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
                <Text style={styles.title}>Welcome{'\n'}Back!</Text>

                {/* Form Fields */}

                {/* Username / Email */}
                <View style={styles.inputContainer}>
                    <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                {/* Password */}
                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                    style={styles.forgotPasswordContainer}
                    onPress={() => router.push('/login/forgot-password')}
                >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>

                {/* Footer Section */}
                <View style={styles.footer}>
                    <Text style={styles.orText}>- OR Continue with -</Text>

                    <GoogleSignIn style={styles.googleButton}>
                        <View style={styles.googleIconContainer}>
                            <Ionicons name="logo-google" size={24} color="#EA4335" />
                        </View>
                    </GoogleSignIn>

                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>Create An Account </Text>
                        <TouchableOpacity onPress={handleSignUp}>
                            <Text style={styles.signupLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
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
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 40,
        lineHeight: 44,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F3F3', // Light gray background
        borderRadius: 12,
        height: 55,
        marginBottom: 15,
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
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginBottom: 30,
    },
    forgotPasswordText: {
        color: '#FF4058',
        fontSize: 14,
        fontWeight: '500',
    },
    loginButton: {
        width: '100%',
        height: 55,
        backgroundColor: '#FF4058',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 50,
        shadowColor: '#FF4058',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        alignItems: 'center',
    },
    orText: {
        color: '#666',
        fontSize: 14,
        marginBottom: 20,
    },
    googleButton: {
        marginBottom: 30,
    },
    googleIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    signupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    signupText: {
        color: '#666',
        fontSize: 14,
    },
    signupLink: {
        color: '#FF4058',
        fontWeight: 'bold',
        fontSize: 14,
        textDecorationLine: 'underline',
    }
});
