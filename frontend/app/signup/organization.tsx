import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function OrganizationSignUpScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // State for form fields
    const [username, setUsername] = useState('');
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
        'University Department',
        'Student Union',
        'Club',
        'NGO',
        'Company',
        'Government',
        'Charity',
        'Foundation',
        'Community Group',
        'Other'
    ];

    const handleCreateAccount = () => {
        // Logic to create account
        router.replace('/(tabs)/home'); // Placeholder navigation
    };

    const handleLogin = () => {
        router.replace('/login');
    };

    const renderDropdownItem = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
                setOrgType(item);
                setDropdownVisible(false);
            }}
        >
            <Text style={styles.dropdownItemText}>{item}</Text>
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
                        placeholder="Username or Email"
                        placeholderTextColor="#999"
                        value={username}
                        onChangeText={setUsername}
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
                            {orgType || "Organization Type"}
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
                    <Text style={styles.orText}>- OR Continue with -</Text>

                    <TouchableOpacity style={styles.googleButton}>
                        <View style={styles.googleIconContainer}>
                            <Ionicons name="logo-google" size={24} color="#EA4335" />
                        </View>
                    </TouchableOpacity>

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
                            keyExtractor={(item) => item}
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
