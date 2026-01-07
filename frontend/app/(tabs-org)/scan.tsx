import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, Alert, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Modern Expo Camera
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const RECT_SIZE = 250;

export default function OrgScanScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [flashMode, setFlashMode] = useState<'on' | 'off'>('off');

    // Handle Permissions
    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        // Camera permissions are still loading
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarcodeScanned = ({ type, data }: { type: string, data: string }) => {
        setScanned(true);
        // Logic: Simulate verifying student ID
        // Mock: If data starts with "STUDENT-", it's valid. content is the ID.
        // Or simply display whatever is scanned for this demo.
        
        // Let's assume the QR contains the Student ID directly.
        const studentId = data; // Simplified
        const isSuccess = Math.random() > 0.2; // 80% success rate mock

        Alert.alert(
            isSuccess ? "Success!" : "Failed",
            isSuccess 
                ? `Student Checked-in Successfully.\nMSSV: ${studentId}` 
                : `Could not verify student.\nMSSV: ${studentId}`,
            [{ text: 'OK', onPress: () => setScanned(false) }]
        );
    };

    const toggleFlash = () => {
        setFlashMode(prev => prev === 'off' ? 'on' : 'off');
    };

    return (
        <View style={styles.container}>
            <CameraView 
                style={styles.camera} 
                facing="back"
                enableTorch={flashMode === 'on'}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            >
                {/* Header Overlay */}
                <SafeAreaView style={styles.headerContainer} edges={['top']}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                        <Ionicons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                    <View style={{flex: 1}}/> 
                    {/* Centered title is slightly complex with absolute header elements, 
                        or we can put it in the overlay below */}
                </SafeAreaView>

                {/* Dark Overlay with Transparent Hole */}
                <View style={styles.overlayLayer}>
                    {/* Top Mask */}
                    <View style={styles.maskTop}>
                        <Text style={styles.scanTitle}>Find the QR Code</Text>
                    </View>
                    
                    <View style={styles.maskCenterRow}>
                        {/* Left Mask */}
                        <View style={styles.maskSide} />
                        
                        {/* Transparent Scanner Window */}
                        <View style={styles.scanWindow}>
                            {/* Corner Markers (Optional UI polish) */}
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                        </View>
                        
                        {/* Right Mask */}
                        <View style={styles.maskSide} />
                    </View>
                    
                    {/* Bottom Mask */}
                    <View style={styles.maskBottom}>
                        {/* Flashlight Button */}
                        <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
                            <Ionicons name={flashMode === 'on' ? "flashlight" : "flashlight-outline"} size={28} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>

            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    permissionText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: '#FF4058',
        padding: 15,
        borderRadius: 10,
    },
    permissionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10, // Above overlay
        paddingHorizontal: 20,
    },
    closeButton: {
        padding: 5,
    },
    
    // Overlay Masking
    overlayLayer: {
        flex: 1,
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
    },
    maskTop: {
        flex: 1.5, // Ratio 
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 40,
    },
    maskCenterRow: {
        height: RECT_SIZE,
        flexDirection: 'row',
    },
    maskSide: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    scanWindow: {
        width: RECT_SIZE,
        height: RECT_SIZE,
        backgroundColor: 'transparent',
    },
    maskBottom: {
        flex: 2, // Ratio
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    scanTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    
    flashButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff', // Or semi-transparent
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },

    // Corners
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#fff',
        borderWidth: 4,
    },
    topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
    topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
    bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
    bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
});
