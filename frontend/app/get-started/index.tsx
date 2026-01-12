import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GetStartedScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const handleGetStarted = () => {
        router.replace('/login');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ImageBackground
                source={require('../../assets/images/get_started.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                {/* Overlay to ensure text readability if needed, though design seems to have dark bottom or specific placement */}
                <View style={styles.overlay}>
                    <View style={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]}>
                        <Text style={styles.title}>
                            You want to make an impact? Here’s your chance!
                        </Text>
                        <Text style={styles.subtitle}>
                            Join, act, and spread kindness today.
                        </Text>

                        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
                            <Text style={styles.buttonText}>Get Started</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)', // Slight dark overlay for text contrast
        justifyContent: 'flex-end',
    },
    contentContainer: {
        paddingHorizontal: 25,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 15,
        lineHeight: 36,
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 40,
    },
    button: {
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
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
