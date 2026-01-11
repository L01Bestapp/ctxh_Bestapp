import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function RoleSelectionScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [selectedRole, setSelectedRole] = useState<'student' | 'organizer' | null>('student'); // Default to student based on image

    const handleContinue = () => {
        if (selectedRole === 'student') {
            router.push('/signup/student');
        } else if (selectedRole === 'organizer') {
            // Navigate to organization signup
            router.push('/signup/organization');
        } else {
            // Fallback or alert
            router.replace('/(tabs-student)/home');
        }
    };

    const handleLogin = () => {
        router.replace('/login');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header Title */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>YOU ARE</Text>
            </View>

            {/* Role Selection Cards */}
            <View style={styles.cardsContainer}>
                {/* Student Card */}
                <TouchableOpacity
                    style={[
                        styles.card,
                        selectedRole === 'student' && styles.cardSelected // Optional Highlight
                    ]}
                    onPress={() => setSelectedRole('student')}
                    activeOpacity={0.8}
                >
                    <View style={[styles.cardImageContainer, selectedRole === 'student' && styles.imageContainerSelected]}>
                        <Image
                            source={require('@/assets/images/student_image.png')}
                            style={styles.cardImage}
                            contentFit="contain"
                        />
                    </View>
                    <Text style={styles.cardLabel}>STUDENT</Text>
                </TouchableOpacity>

                {/* Organizer Card */}
                <TouchableOpacity
                    style={[
                        styles.card,
                        selectedRole === 'organizer' && styles.cardSelected
                    ]}
                    onPress={() => setSelectedRole('organizer')}
                    activeOpacity={0.8}
                >
                    <View style={[styles.cardImageContainer, selectedRole === 'organizer' && styles.imageContainerSelected]}>
                        <Image
                            source={require('@/assets/images/org_image.png')}
                            style={styles.cardImage}
                            contentFit="contain"
                        />
                    </View>
                    <Text style={styles.cardLabel}>ORGANIZER</Text>
                </TouchableOpacity>
            </View>

            {/* Continue Button */}
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>

            {/* OR Separator */}
            <View style={styles.orContainer}>
                <Text style={styles.orText}>- OR Continue with -</Text>
            </View>

            {/* Google Login (Placeholder) */}
            {/* <TouchableOpacity style={styles.googleButton}> */}
                {/* Use Ionicons logo-google if available, or just a generic placeholder for now */}
                {/* Or build a circle with G logo */}
                {/* <View style={styles.googleIconContainer}> */}
                    {/* <Ionicons name="logo-google" size={24} color="#EA4335" /> */}
                {/* </View> */}
            {/* </TouchableOpacity> */}

            {/* Already Account */}
            <View style={styles.loginContainer}>
                <Text style={styles.loginText}>I Already Have an Account </Text>
                <TouchableOpacity onPress={handleLogin}>
                    <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    header: {
        marginTop: 40,
        marginBottom: 40,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 40,
        gap: 20,
    },
    card: {
        flex: 1,
        alignItems: 'center',
    },
    cardImageContainer: {
        width: '100%',
        aspectRatio: 1, // Square
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden',
    },
    imageContainerSelected: {
        borderColor: '#E53935', // Highlight color? Or keep black as design seems neutral
        borderWidth: 2,
    },
    cardSelected: {
        // Opacity or scale if needed
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardLabel: {
        fontSize: 18,
        fontWeight: '900', // Heavy bold
        textAlign: 'center',
        color: '#000',
        textTransform: 'uppercase',
    },
    continueButton: {
        width: '100%',
        height: 55,
        backgroundColor: '#FF4058', // Red/Pink from image
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    orContainer: {
        marginBottom: 20,
    },
    orText: {
        color: '#666',
        fontSize: 14,
    },
    googleButton: {
        marginBottom: 20, // Reduced margin
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
        // Removed absolute positioning
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
    }
});
