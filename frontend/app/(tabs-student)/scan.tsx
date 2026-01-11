import React, { useState, useEffect, useRef } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { captureRef } from 'react-native-view-shot';

// Get screen width for responsive sizing
const { width } = Dimensions.get('window');

export default function StudentScanScreen() {
    const router = useRouter();
    const { token, user, logout } = useAuth();
    const [studentInfo, setStudentInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const viewRef = useRef<View>(null);

    useEffect(() => {
        fetchMyQr();
    }, [token]);

    const fetchMyQr = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch('https://marg-astonishing-matthias.ngrok-free.dev/api/v1/students/my-qr', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const json = await response.json();

            // Check for Ban
            if (response.status === 403 || (json.message && json.message.toLowerCase().includes("banned"))) {
                Alert.alert("Account Suspended", "Your account has been banned. You will be logged out.");
                await logout();
                router.replace('/login');
                return;
            }

            if (json.success || json.code === 0) {
                setStudentInfo(json.data);
            } else {
                Alert.alert("Error", json.message || "Failed to load QR code");
            }
        } catch (error) {
            console.error("Fetch QR Error:", error);
            Alert.alert("Error", "Failed to load QR code");
        } finally {
            setLoading(false);
        }
    };

    // Helper to get QR URL
    const getQrUrl = () => {
        if (!studentInfo?.qrCodeData) return null;
        return `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(studentInfo.qrCodeData)}&color=1D1D1D&bgcolor=FFFFFF`;
    };

    const handleShare = async () => {
        try {
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert("Error", "Sharing is not available on this device");
                return;
            }

            if (!viewRef.current) return;

            const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 1,
            });

            await Sharing.shareAsync(uri);
        } catch (error: any) {
            console.log("Share error:", error);
            Alert.alert("Error", error.message);
        }
    };

    const handleSave = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync(true);
            if (status !== 'granted') {
                Alert.alert("Permission required", "Please grant permission to save the QR code.");
                return;
            }

            if (!viewRef.current) return;

            const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 1,
            });

            console.log("Captured URI:", uri);
            await MediaLibrary.createAssetAsync(uri);
            Alert.alert("Success", "QR Card saved to gallery!");

        } catch (error: any) {
            console.log("Save error:", error);
            Alert.alert("Error", error.message || "Failed to save QR code");
        }
    };

    const handleDone = () => {
        router.push('/(tabs-student)/home');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Your QR Code</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Wrapper for Capture - styled to look like a card */}
                <View
                    ref={viewRef}
                    collapsable={false}
                    style={{
                        backgroundColor: '#fff',
                        alignItems: 'center',
                        padding: 30,
                        borderRadius: 20,
                        marginBottom: 20,
                        // Add shadow/border for the capture view itself if we want it to look "framed" in the saved image
                        // or just keep it clean white. Let's add a subtle border for the "Card" look.
                        borderWidth: 8,
                        borderColor: '#FF4058',
                    }}
                >
                    {/* Profile Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={studentInfo?.avatarUrl ? { uri: studentInfo.avatarUrl } : require('../../assets/images/student_image.png')}
                                style={styles.avatar}
                            />
                        </View>
                        <Text style={styles.studentName}>{studentInfo?.fullName || user?.name || "Student Name"}</Text>
                        {studentInfo?.mssv && <Text style={{ color: '#666', marginTop: 4 }}>{studentInfo.mssv}</Text>}
                    </View>

                    {/* QR Code Section */}
                    <View style={styles.qrContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#FF4058" style={{ height: 200 }} />
                        ) : studentInfo?.qrCodeData ? (
                            <Image
                                source={{ uri: getQrUrl()! }}
                                style={styles.qrImage}
                            />
                        ) : (
                            <View style={[styles.qrImage, { justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={{ color: '#999' }}>Failed to load QR</Text>
                            </View>
                        )}
                    </View>

                    <Text style={{ marginTop: 10, color: '#FF4058', fontWeight: 'bold' }}>STUDENT PASS</Text>
                </View>

                {/* Instructions */}
                <Text style={styles.instructionText}>Show this QR code at check-in</Text>

                {/* Warning Box */}
                <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                        <Text style={{ fontWeight: 'bold' }}>Important:</Text> Please arrive 15 minutes early for check-in. Save this QR code or take a screenshot.
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
                        <Ionicons name="download-outline" size={20} color="#FF4058" />
                        <Text style={styles.actionButtonText}>Save</Text>
                    </TouchableOpacity>

                    <View style={{ width: 20 }} />

                    <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                        <Ionicons name="share-social-outline" size={20} color="#FF4058" />
                        <Text style={styles.actionButtonText}>Share</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />

                {/* Done Button */}
                <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 150,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 10,
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },

    // Profile
    profileSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        marginBottom: 15,
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#fff',
    },
    studentName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },

    // QR Card
    qrCard: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        shadowColor: "#FF4058",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#FFE0E5',
    },
    qrContainer: {
        padding: 10,
        backgroundColor: '#fff',
    },
    qrImage: {
        width: 200,
        height: 200,
    },

    // Instruction link
    instructionText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 25,
        fontWeight: '500',
    },

    // Warning
    warningBox: {
        backgroundColor: '#FFFDE7', // Light Yellow
        padding: 15,
        borderRadius: 12,
        marginBottom: 30,
        width: '100%',
        borderWidth: 1,
        borderColor: '#FFF59D',
    },
    warningText: {
        fontSize: 13,
        color: '#F57F17',
        lineHeight: 20,
        textAlign: 'center',
    },

    // Actions
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 30,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FFC1C8',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 25,
        backgroundColor: '#FFF0F3',
        minWidth: 120,
    },
    actionButtonText: {
        marginLeft: 8,
        color: '#FF4058',
        fontWeight: '600',
        fontSize: 14,
    },

    // Done Button
    doneButton: {
        backgroundColor: '#FF4058',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#FF4058',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
