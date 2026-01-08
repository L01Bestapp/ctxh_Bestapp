import React, { useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ScrollView, Alert, Dimensions, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, GreatVibes_400Regular } from '@expo-google-fonts/great-vibes';
import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold, PlayfairDisplay_700Bold_Italic } from '@expo-google-fonts/playfair-display';

const { width, height } = Dimensions.get('window');

interface CertificateModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function CertificateModal({ visible, onClose }: CertificateModalProps) {
    const viewShotRef = useRef<ViewShot>(null);

    let [fontsLoaded] = useFonts({
        GreatVibes_400Regular,
        PlayfairDisplay_400Regular,
        PlayfairDisplay_700Bold,
        PlayfairDisplay_700Bold_Italic,
    });

    const handleSave = async () => {
        try {
            if (viewShotRef.current && (viewShotRef.current as any).capture) {
                const uri = await (viewShotRef.current as any).capture();
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status === 'granted') {
                    await MediaLibrary.createAssetAsync(uri);
                    Alert.alert("Success", "Certificate saved to gallery!");
                } else {
                    Alert.alert("Permission required", "Please grant permission to save.");
                }
            }
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    const handleShare = async () => {
        try {
            if (viewShotRef.current && (viewShotRef.current as any).capture) {
                const uri = await (viewShotRef.current as any).capture();
                const isAvailable = await Sharing.isAvailableAsync();
                if (isAvailable) {
                    await Sharing.shareAsync(uri);
                } else {
                    Alert.alert("Error", "Sharing is not available");
                }
            }
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>

                    {/* Header with Close Button */}
                    <View style={styles.modalActions}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close-circle" size={32} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                        {/* Certificate View to Capture */}
                        <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 1.0 }} style={styles.captureContainer}>

                            {/* Gold/Premium Gradient Border */}
                            <LinearGradient
                                colors={['#C5A059', '#E6C888', '#C5A059']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.outerBorder}
                            >
                                <View style={styles.certificatePaper}>

                                    {/* Corner Decorations */}
                                    <View style={[styles.corner, styles.cornerTL]} />
                                    <View style={[styles.corner, styles.cornerTR]} />
                                    <View style={[styles.corner, styles.cornerBL]} />
                                    <View style={[styles.corner, styles.cornerBR]} />

                                    {/* Decorative Icon */}
                                    <View style={styles.headerIcon}>
                                        <MaterialCommunityIcons name="trophy-award" size={50} color="#C5A059" />
                                    </View>

                                    <Text style={styles.certHeader}>CERTIFICATE</Text>
                                    <Text style={styles.certSubHeader}>OF APPRECIATION</Text>

                                    <View style={styles.separatorLine} />

                                    <Text style={styles.presentText}>PROUDLY PRESENTED TO</Text>

                                    {/* Name */}
                                    <Text style={styles.recipientName}>Sarah Taylor</Text>

                                    <Text style={styles.bodyText}>
                                        For outstanding contribution and dedication to the
                                    </Text>
                                    <Text style={styles.programName}>UNI VOLUNTEER PROGRAM</Text>

                                    <View style={styles.statsContainer}>
                                        <View style={styles.statItem}>
                                            <MaterialCommunityIcons name="clock-time-four-outline" size={20} color="#888" />
                                            <Text style={styles.statText}>24.5 Hours</Text>
                                        </View>
                                        <View style={styles.verticalLine} />
                                        <View style={styles.statItem}>
                                            <MaterialCommunityIcons name="star-circle-outline" size={20} color="#888" />
                                            <Text style={styles.statText}>12 Activities</Text>
                                        </View>
                                    </View>

                                    {/* Signature Section */}
                                    <View style={styles.footerRow}>
                                        <View style={styles.signatureBlock}>
                                            <Text style={styles.signatureText}>Jane Smith</Text>
                                            <View style={styles.line} />
                                            <Text style={styles.signLabel}>Program Director</Text>
                                        </View>

                                        {/* Gold Seal */}
                                        <View style={styles.sealContainer}>
                                            <MaterialCommunityIcons name="seal" size={45} color="#C5A059" />
                                            <Text style={styles.sealText}>2025</Text>
                                        </View>

                                        <View style={styles.signatureBlock}>
                                            <Text style={styles.dateText}>Oct 17, 2025</Text>
                                            <View style={styles.line} />
                                            <Text style={styles.signLabel}>Date</Text>
                                        </View>
                                    </View>

                                </View>
                            </LinearGradient>
                        </ViewShot>

                        {/* Control Buttons */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
                                <LinearGradient
                                    colors={['#4CAF50', '#45a049']}
                                    style={styles.btnGradient}
                                >
                                    <Ionicons name="download" size={20} color="#fff" />
                                    <Text style={styles.btnText}>Save Image</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={{ width: 15 }} />

                            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                                <LinearGradient
                                    colors={['#2196F3', '#1976D2']}
                                    style={styles.btnGradient}
                                >
                                    <Ionicons name="share-social" size={20} color="#fff" />
                                    <Text style={styles.btnText}>Share</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    modalActions: {
        position: 'absolute',
        top: 45,
        right: 25,
        zIndex: 20,
    },
    closeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white bg
        borderRadius: 20,
        padding: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },

    // Capture Container
    captureContainer: {
        marginBottom: 30,
        backgroundColor: 'transparent',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        marginTop: 60, // Add margin top so it doesn't overlap with close button visually
    },
    outerBorder: {
        padding: 10,
        width: width * 0.9,
        borderRadius: 15,
    },
    certificatePaper: {
        backgroundColor: '#FFFCF5', // Cream/Ivory background
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E6C888',
        position: 'relative',
    },

    // Corners
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#C5A059',
    },
    cornerTL: { top: 10, left: 10, borderTopWidth: 2, borderLeftWidth: 2 },
    cornerTR: { top: 10, right: 10, borderTopWidth: 2, borderRightWidth: 2 },
    cornerBL: { bottom: 10, left: 10, borderBottomWidth: 2, borderLeftWidth: 2 },
    cornerBR: { bottom: 10, right: 10, borderBottomWidth: 2, borderRightWidth: 2 },

    // Header Content
    headerIcon: {
        marginBottom: 15,
    },
    certHeader: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        letterSpacing: 3,
        fontFamily: Platform.OS === 'ios' ? 'Palatino' : 'serif',
    },
    certSubHeader: {
        fontSize: 14,
        color: '#C5A059',
        letterSpacing: 4,
        marginTop: 5,
        fontWeight: '600',
    },
    separatorLine: {
        height: 2,
        width: 100,
        backgroundColor: '#C5A059',
        marginTop: 15,
        marginBottom: 30,
    },

    // Main Content
    presentText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 10,
    },
    recipientName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2c3e50',
        fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
        marginBottom: 15,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    bodyText: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    programName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#C5A059',
        marginTop: 5,
        marginBottom: 25,
        letterSpacing: 1,
    },

    // Stats
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 35,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    verticalLine: {
        width: 1,
        height: 20,
        backgroundColor: '#ddd',
        marginHorizontal: 15,
    },
    statText: {
        marginLeft: 8,
        color: '#555',
        fontWeight: '600',
        fontSize: 13,
    },

    // Footer
    footerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Align top, control heights inside blocks
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    signatureBlock: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    signatureText: {
        fontSize: 15,
        fontFamily: 'DancingScript_700Bold',
        color: '#2c3e50',
        marginBottom: 5,
        height: 30,
        textAlignVertical: 'center',
        textAlign: 'center',
        fontWeight: 'bold', // Explicitly bold
        fontStyle: 'italic', // Explicitly italic
    },
    dateText: {
        fontSize: 13,
        fontFamily: 'Cinzel_700Bold',
        color: '#2c3e50',
        marginBottom: 5,
        height: 30,
        textAlignVertical: 'bottom',
        textAlign: 'center',
        fontWeight: 'bold', // Explicitly bold
        // No italic
    },
    line: {
        height: 1,
        backgroundColor: '#333',
        width: '100%', // Full width of the padding-constrained block
        marginBottom: 5,
    },
    signLabel: {
        fontSize: 11,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
    },
    sealContainer: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
    },
    sealText: {
        color: '#C5A059', // Gold color since it's now below the icon
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5,
    },

    // Buttons
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '90%',
    },
    actionButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    btnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 8,
    },
});
