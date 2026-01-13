import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Image, FlatList, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { Config } from '@/constants/Config';

const { width } = Dimensions.get('window');
const RECT_SIZE = 250;

// Reusing Activity Interface
interface Activity {
    activityId: number;
    title: string;
    imageUrl?: string;
    activityStatus: string; // UPCOMING, ONGOING, ENDED
    startDateTime: string;
    endDateTime: string;
    address: string;
}

export default function OrgScanScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const [permission, requestPermission] = useCameraPermissions();

    // State
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [scanned, setScanned] = useState(false);
    const [flashMode, setFlashMode] = useState<'on' | 'off'>('off');
    const [scanMode, setScanMode] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');

    // Processing Lock to prevent multi-scan
    const isProcessing = React.useRef(false);

    // Fetch Activities on Mount
    useEffect(() => {
        fetchActivities();
    }, [token]);

    const fetchActivities = async () => {
        if (!token) return;
        try {
            const url = `${Config.API_BASE_URL}/activities/get-all-activity-for-organization?t=${Date.now()}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const json = await response.json();

            if (json.success && json.data) {
                setActivities(json.data.filter((a: Activity) => {
                    if (a.activityStatus !== 'ENDED') return true;
                    // Allow check-in for 2 days after end date
                    const endDate = new Date(a.endDateTime);
                    const now = new Date();
                    // Check if within 2 days after end date
                    const expirationDate = new Date(endDate);
                    expirationDate.setDate(expirationDate.getDate() + 2);
                    return now <= expirationDate;
                }));
            }
        } catch (error) {
            console.error("Fetch Activities Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchActivities();
    };

    // Camera Handlers
    useEffect(() => {
        if (selectedActivity && !permission) {
            requestPermission();
        }
    }, [selectedActivity, permission]);

    const resetScan = () => {
        setScanned(false);
        isProcessing.current = false;
    };

    const handleBarcodeScanned = async ({ type, data, cornerPoints, bounds }: any) => {
        if (!selectedActivity || scanned || isProcessing.current) return;

        // 1. Calculate Scan Window Coordinates
        const { height } = Dimensions.get('window');
        const scanAreaX = (width - RECT_SIZE) / 2;
        const scanAreaY = (height - RECT_SIZE) / 2; // Approximate center

        // 2. Determine Code Position
        let codeX = 0, codeY = 0;

        if (bounds && bounds.origin) {
            // iOS often returns bounds
            codeX = bounds.origin.x + (bounds.size.width / 2);
            codeY = bounds.origin.y + (bounds.size.height / 2);
        } else if (cornerPoints && cornerPoints.length > 0) {
            // Android often returns cornerPoints
            const xSum = cornerPoints.reduce((acc: number, p: any) => acc + p.x, 0);
            const ySum = cornerPoints.reduce((acc: number, p: any) => acc + p.y, 0);
            codeX = xSum / cornerPoints.length;
            codeY = ySum / cornerPoints.length;
        }

        // 3. Filter: Check if center is roughly inside square (with loose margin)
        // Only run logic if we successfully got coordinates. If not, fallback to allow scan.
        if (codeX > 0 && codeY > 0) {
            const marginX = 50;  // Widen horizontal tolerance
            const marginY = 80;  // Widen vertical tolerance significantly

            if (
                codeX < scanAreaX - marginX ||
                codeX > scanAreaX + RECT_SIZE + marginX ||
                codeY < scanAreaY - marginY ||
                codeY > scanAreaY + RECT_SIZE + marginY
            ) {
                // Ignore code outside region
                return;
            }
        }

        isProcessing.current = true;
        setScanned(true);

        const endpoint = scanMode === 'CHECK_IN'
            ? `${Config.API_BASE_URL}/attendance/check-in`
            : `${Config.API_BASE_URL}/attendance/check-out`;

        const actionName = scanMode === 'CHECK_IN' ? 'Check-in' : 'Check-out';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    activityId: selectedActivity.activityId,
                    qrCodeData: data
                })
            });

            const json = await response.json();

            if (json.success || json.code === 0) {
                const s = json.data;
                const time = scanMode === 'CHECK_IN' ? s.checkInTime : s.checkOutTime;
                Alert.alert(
                    `${actionName} Successful ✅`,
                    `Student: ${s.fullName}\nMSSV: ${s.mssv}\nStatus: ${s.status}\nTime: ${time ? new Date(time).toLocaleTimeString() : 'N/A'}`,
                    [{ text: 'Next', onPress: resetScan }]
                );
            } else {
                // Handle Duplicate Check-in nicely
                const msg = json.message || JSON.stringify(json);
                if (msg.includes('duplicate key') || msg.toLowerCase().includes('already exists')) {
                    Alert.alert(
                        `Already Processed ⚠️`,
                        `Student has already ${actionName.toLowerCase()}ed for this activity today.`,
                        [{ text: 'OK', onPress: resetScan }]
                    );
                } else {
                    Alert.alert(
                        `${actionName} Failed ❌`,
                        json.message || "Unknown error occurred",
                        [{ text: 'Retry', onPress: resetScan }]
                    );
                }
            }

        } catch (error) {
            console.error("Scan Error:", error);
            Alert.alert(
                "Error",
                "Network request failed. Please try again.",
                [{ text: 'OK', onPress: resetScan }]
            );
        }
    };

    const toggleFlash = () => {
        setFlashMode(prev => prev === 'off' ? 'on' : 'off');
    };

    const renderActivityItem = ({ item }: { item: Activity }) => {
        const cleanUrl = item.imageUrl ? item.imageUrl.trim() : '';
        const imageSource = (cleanUrl.startsWith('http')) ? { uri: cleanUrl } : require('../../assets/images/alternative.png');

        // Color logic & Normalization
        let statusColor = '#616161';
        let statusBg = '#EEEEEE';
        let s = (item.activityStatus || 'UNKNOWN').toUpperCase();

        // Map undefined/strange statuses to ENDED if not UPCOMING/ONGOING
        if (s !== 'UPCOMING' && s !== 'ONGOING') {
            s = 'ENDED';
        }

        if (s === 'UPCOMING') {
            statusColor = '#009688'; statusBg = '#E0F2F1';
        } else if (s === 'ONGOING') {
            statusColor = '#FF9800'; statusBg = '#FFF3E0';
        } else {
            // ENDED
            statusColor = '#616161'; statusBg = '#EEEEEE';
        }

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => setSelectedActivity(item)}
            >
                <Image source={imageSource} style={styles.cardImage} />
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Text style={styles.cardDate}>
                            {new Date(item.startDateTime).toLocaleDateString()}
                        </Text>
                        <View style={{
                            marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2,
                            backgroundColor: statusBg, borderRadius: 4
                        }}>
                            <Text style={{ color: statusColor, fontSize: 10, fontWeight: 'bold' }}>{s}</Text>
                        </View>
                    </View>

                    <View style={styles.scanAction}>
                        <Ionicons name="qr-code-outline" size={16} color="#FF4058" />
                        <Text style={styles.scanActionText}>Tap to Scan</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>
        );
    };

    // 1. If no activity selected, show list
    if (!selectedActivity) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Select Activity</Text>
                    <Text style={styles.headerSubtitle}>Choose an activity to start check-in</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#FF4058" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={activities}
                        renderItem={renderActivityItem}
                        keyExtractor={item => item.activityId.toString()}
                        contentContainerStyle={styles.listContent}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF4058']} />}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No active activities found.</Text>
                            </View>
                        )}
                    />
                )}
            </SafeAreaView>
        );
    }

    // 2. If activity selected, show Camera
    if (!permission?.granted) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ marginBottom: 20 }}>Camera permission is required</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.cameraContainer}>
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
                <SafeAreaView style={styles.cameraHeader} edges={['top']}>
                    <TouchableOpacity onPress={() => setSelectedActivity(null)} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={styles.cameraTitle} numberOfLines={1}>{selectedActivity.title}</Text>
                        {/* Mode Indicator */}
                        <View style={{
                            backgroundColor: scanMode === 'CHECK_IN' ? 'rgba(0,150,136,0.8)' : 'rgba(255,87,34,0.8)',
                            paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, marginTop: 4
                        }}>
                            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{scanMode === 'CHECK_IN' ? 'CHECK-IN MODE' : 'CHECK-OUT MODE'}</Text>
                        </View>
                    </View>
                    <View style={{ width: 40 }} />
                </SafeAreaView>

                {/* Scan Overlay */}
                <View style={styles.overlayLayer}>
                    <View style={styles.maskTop}>
                        {/* Mode Toggle Switch */}
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                style={[styles.toggleButton, scanMode === 'CHECK_IN' && styles.toggleActive]}
                                onPress={() => setScanMode('CHECK_IN')}
                            >
                                <Text style={[styles.toggleText, scanMode === 'CHECK_IN' && styles.toggleTextActive]}>Check-in</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleButton, scanMode === 'CHECK_OUT' && styles.toggleActive]}
                                onPress={() => setScanMode('CHECK_OUT')}
                            >
                                <Text style={[styles.toggleText, scanMode === 'CHECK_OUT' && styles.toggleTextActive]}>Check-out</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.scanHint}>Scanning for {scanMode === 'CHECK_IN' ? 'Check-in' : 'Check-out'}...</Text>
                    </View>
                    <View style={styles.maskRow}>
                        <View style={styles.maskSide} />
                        <View style={styles.scanWindow}>
                            <View style={[styles.corner, styles.topLeft, { borderColor: scanMode === 'CHECK_IN' ? '#009688' : '#FF5722' }]} />
                            <View style={[styles.corner, styles.topRight, { borderColor: scanMode === 'CHECK_IN' ? '#009688' : '#FF5722' }]} />
                            <View style={[styles.corner, styles.bottomLeft, { borderColor: scanMode === 'CHECK_IN' ? '#009688' : '#FF5722' }]} />
                            <View style={[styles.corner, styles.bottomRight, { borderColor: scanMode === 'CHECK_IN' ? '#009688' : '#FF5722' }]} />
                        </View>
                        <View style={styles.maskSide} />
                    </View>
                    <View style={styles.maskBottom}>
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
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    listContent: {
        padding: 15,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    },
    // Card Style
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    cardContent: {
        flex: 1,
        marginLeft: 12,
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    cardDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 6,
    },
    scanAction: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scanActionText: {
        fontSize: 12,
        color: '#FF4058',
        fontWeight: '600',
        marginLeft: 4,
    },

    // Camera Styles
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    cameraHeader: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    cameraTitle: {
        flex: 1,
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginHorizontal: 10,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },

    // Overlay
    overlayLayer: {
        flex: 1,
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
    },
    maskTop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 40,
    },
    scanHint: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 20,
    },
    maskRow: {
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
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        paddingTop: 40,
    },
    flashButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    permissionButton: {
        backgroundColor: '#FF4058',
        padding: 15,
        borderRadius: 10,
    },
    permissionButtonText: {
        color: '#fff', fontWeight: 'bold'
    },
    corner: {
        position: 'absolute', width: 30, height: 30, borderColor: '#FF4058', borderWidth: 4
    },
    topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
    topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
    bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
    bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },

    // Toggle Styles
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 25,
        padding: 4,
        marginBottom: 15,
    },
    toggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    toggleActive: {
        backgroundColor: '#fff',
    },
    toggleText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    toggleTextActive: {
        color: '#000',
        fontWeight: 'bold',
    }
});
