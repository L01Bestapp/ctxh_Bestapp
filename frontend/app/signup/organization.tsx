import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Modal, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GoogleSignIn from '@/components/GoogleSignIn';
import { useAuth } from '../context/AuthContext';

export default function OrganizationSignUpScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { login } = useAuth();

    // State for form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [orgName, setOrgName] = useState('');
    const [phone, setPhone] = useState('');
    const [orgType, setOrgType] = useState('');

    // Visibility toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Dropdown State
    const [dropdownVisible, setDropdownVisible] = useState(false);

    // Organization Types
    const orgTypes = [
        { label: 'University Department', value: 'UNIVERSITY_DEPARTMENT' },
        { label: 'Student Union', value: 'STUDENT_UNION' },
        { label: 'Club', value: 'CLUB' },
        { label: 'NGO', value: 'NGO' },
        { label: 'Company', value: 'COMPANY' },
        { label: 'Government', value: 'GOVERNMENT' },
        { label: 'Charity', value: 'CHARITY' },
        { label: 'Foundation', value: 'FOUNDATION' },
        { label: 'Community Group', value: 'COMMUNITY_GROUP' },
        { label: 'Other', value: 'OTHER' }
    ];

    // Helper to decode JWT
    const parseJwt = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    const handleGoogleLogin = async (idToken: string) => {
        try {
            // Call Backend
            const response = await fetch('https://marg-astonishing-matthias.ngrok-free.dev/api/v1/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken })
            });
            const json = await response.json();

            if (json.success && json.data && json.data.accessToken) {
                const accessToken = json.data.accessToken;

                // Decode token to find role if not in response
                let role = json.data.role;
                if (!role) {
                    const decoded = parseJwt(accessToken);
                    if (decoded) {
                        // Check fields where role might be
                        role = decoded.role || (Array.isArray(decoded.scope) ? decoded.scope[0] : decoded.scope);
                        // Infer from ID presence if still missing
                        if (!role && decoded.organizationId) role = 'ORGANIZATION';
                    }
                }

                const normalizedRole = (role || '').toUpperCase();

                // Call login context
                await login(accessToken, { ...json.data, email: json.data.email || 'Google User' });

                // Check Profile Completion for Students
                if (normalizedRole === 'STUDENT' && json.data.profileComplete === false) {
                    router.replace('/signup/google-student-id');
                    return;
                }

                if (normalizedRole === 'ORGANIZATION') {
                    router.replace('/(tabs-org)/home');
                } else if (normalizedRole === 'STUDENT') {
                    router.replace('/(tabs-student)/home');
                } else if (normalizedRole === 'ADMIN') {
                    // @ts-ignore
                    router.replace('/admin/dashboard');
                } else {
                    // Default fallback
                    router.replace('/(tabs-student)/home');
                }
            } else {
                Alert.alert("Google Login Failed", json.message || "Could not verify with backend.");
            }
        } catch (error) {
            console.error("Google Login Error:", error);
            Alert.alert("Error", "Network error during Google Login.");
        }
    };

    const handleCreateAccount = async () => {
        // Validation
        if (!email || !password || !confirmPassword || !orgName || !phone || !orgType) {
            Alert.alert("Missing Information", "Please fill in all required fields.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Invalid Input", "Please enter a valid email address.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Invalid Input", "Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            Alert.alert("Invalid Input", "Password must be at least 8 characters long.");
            return;
        }

        try {
            const payload = {
                email: email,
                password: password,
                organizationName: orgName,
                organizationType: orgType,
                phoneNumber: phone
            };

            const response = await fetch('https://marg-astonishing-matthias.ngrok-free.dev/api/v1/organization/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const json = await response.json();

            if (json.success) {
                const newOrgId = json.data?.organizationId;
                if (newOrgId !== undefined && newOrgId !== null) {
                    Alert.alert(
                        "Success",
                        `Account created! ID: ${newOrgId}\nPlease activate your account manually via API.`,
                        [{ text: "OK", onPress: () => router.replace('/login') }]
                    );
                } else {
                    Alert.alert(
                        "Success (No ID Found)",
                        `Account created but could not find ID.\nResponse: ${JSON.stringify(json.data)}`,
                        [{ text: "OK", onPress: () => router.replace('/login') }]
                    );
                }
            } else {
                let errorMessage = json.message || "Could not create account.";
                if (json.data && typeof json.data === 'object') {
                    const errors = Object.entries(json.data).map(([key, msg]) => {
                        const fieldName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        return `• ${fieldName}: ${msg as string}`;
                    });
                    if (errors.length > 0) {
                        errorMessage = errors.join('\n');
                    }
                }
                Alert.alert("Registration Failed", errorMessage);
            }
        } catch (error) {
            Alert.alert("Error", "An network error occurred. Please try again.");
        }
    };

    const handleLogin = () => {
        router.replace('/login');
    };

    const renderDropdownItem = ({ item }: { item: { label: string, value: string } }) => (
        <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
                setOrgType(item.value);
                setDropdownVisible(false);
            }}
        >
            <Text style={styles.dropdownItemText}>{item.label}</Text>
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.container,
                    { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <StatusBar style="dark" />

                {/* Premium Header */}
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>CREATE AN ACCOUNT</Text>
                    <View style={styles.titleUnderline} />
                </View>

                {/* Form Fields */}

                {/* Username / Email */}
                <View style={styles.inputContainer}>
                    <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
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

                {/* Confirm Password */}
                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor="#999"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                        <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Organization Name */}
                <View style={styles.inputContainer}>
                    <Ionicons name="business" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Organization Name"
                        placeholderTextColor="#999"
                        value={orgName}
                        onChangeText={setOrgName}
                    />
                </View>

                {/* Phone Number */}
                <View style={styles.inputContainer}>
                    <Ionicons name="call" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Phone Number"
                        placeholderTextColor="#999"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />
                </View>

                {/* Organization Type Dropdown */}
                <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={() => setDropdownVisible(true)}
                >
                    <Ionicons name="people" size={20} color="#666" style={styles.inputIcon} />
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16, color: orgType ? '#333' : '#999' }}>
                            {orgType ? orgTypes.find(t => t.value === orgType)?.label : "Organization Type"}
                        </Text>
                    </View>
                    <Ionicons name="caret-down" size={20} color="#666" style={{ marginRight: 10 }} />
                </TouchableOpacity>

                {/* Terms Text */}
                <Text style={styles.termsText}>
                    By clicking the <Text style={styles.termsHighlight}>Create Account</Text> button, you agree to the public offer
                </Text>

                {/* Create Account Button */}
                <TouchableOpacity style={styles.createButton} onPress={handleCreateAccount}>
                    <Text style={styles.createButtonText}>Create Account</Text>
                </TouchableOpacity>

                {/* Footer Section */}
                <View style={styles.footer}>
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>I Already Have an Account </Text>
                        <TouchableOpacity onPress={handleLogin}>
                            <Text style={styles.loginLink}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Modal for Dropdown */}
            <Modal
                visible={dropdownVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDropdownVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setDropdownVisible(false)}
                >
                    <View style={styles.dropdownModal}>
                        <Text style={styles.dropdownTitle}>Select Organization Type</Text>
                        <FlatList
                            data={orgTypes}
                            renderItem={renderDropdownItem}
                            keyExtractor={(item) => item.value}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
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
        marginTop: 30,
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 10,
    },
    titleUnderline: {
        width: 60,
        height: 6,
        backgroundColor: '#FF4058',
        borderRadius: 3,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F3F3',
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
    termsText: {
        fontSize: 13,
        color: '#888',
        marginBottom: 20,
        lineHeight: 20,
        marginTop: 5,
    },
    termsHighlight: {
        color: '#FF4058',
    },
    createButton: {
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
    createButtonText: {
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
        marginBottom: 20,
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
    loginContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    loginText: {
        color: '#666',
        fontSize: 14,
    },
    loginLink: {
        color: '#FF4058',
        fontWeight: 'bold',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownModal: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        maxHeight: '60%',
    },
    dropdownTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    dropdownItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
    }
});
