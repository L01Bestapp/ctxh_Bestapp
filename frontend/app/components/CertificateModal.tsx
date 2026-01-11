import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, Dimensions, Platform, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, GreatVibes_400Regular } from '@expo-google-fonts/great-vibes';
import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold, PlayfairDisplay_700Bold_Italic } from '@expo-google-fonts/playfair-display';
import { DancingScript_700Bold } from '@expo-google-fonts/dancing-script';
import { Cinzel_700Bold } from '@expo-google-fonts/cinzel';

const { width, height } = Dimensions.get('window');

interface Certificate {
    certificateId: number;
    certificateCode: string;
    studentName: string;
    activityTitle: string;
    ctxhHours: number;
    representativeName: string;
    issuedDate: string;
    organizationName?: string;
    [key: string]: any;
}

interface CertificateModalProps {
    visible: boolean;
    onClose: () => void;
    certificates: Certificate[];
}

export default function CertificateModal({ visible, onClose, certificates = [] }: CertificateModalProps) {
    const router = useRouter(); // Initialize router
    const viewShotRef = useRef<ViewShot>(null);
    const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

    let [fontsLoaded] = useFonts({
        GreatVibes_400Regular,
        PlayfairDisplay_400Regular,
        PlayfairDisplay_700Bold,
        PlayfairDisplay_700Bold_Italic,
        DancingScript_700Bold,
        Cinzel_700Bold,
    });

    const handleSave = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync(true);
            if (status !== 'granted') {
                Alert.alert("Permission Required", "Please allow access to photos to save the certificate.");
                return;
            }

            if (viewShotRef.current && (viewShotRef.current as any).capture) {
                const uri = await (viewShotRef.current as any).capture();
                await MediaLibrary.createAssetAsync(uri);
                Alert.alert("Success", "Certificate saved to gallery!");
            }
        } catch (error: any) {
            console.error("Save Error:", error);
            Alert.alert("Error", "Failed to save: " + error.message);
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

    const renderCertificateItem = ({ item }: { item: Certificate }) => (
        <TouchableOpacity
            style={styles.listItem}
            onPress={() => setSelectedCert(item)}
        >
            <View style={styles.listIcon}>
                <MaterialCommunityIcons name="certificate" size={28} color="#C5A059" />
            </View>
            <View style={styles.listContent}>
                <Text style={styles.listTitle} numberOfLines={2}>{item.activityTitle}</Text>
                <Text style={styles.listSub}>{new Date(item.issuedDate).toLocaleDateString()} • {item.ctxhHours} Hours</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
    );

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

                    {/* View: List or Detailed Certificate */}
                    {!selectedCert ? (
                        <View style={styles.listContainer}>
                            <Text style={styles.listHeaderTitle}>My Certificates</Text>
                            <View style={styles.listDivider} />

                            {certificates.length === 0 ? (
                                <View style={styles.emptyView}>
                                    <MaterialCommunityIcons name="text-box-search-outline" size={48} color="#ccc" />
                                    <Text style={styles.emptyText}>No certificates found yet.</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={certificates}
                                    renderItem={renderCertificateItem}
                                    keyExtractor={(item) => item.certificateId.toString()}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                    showsVerticalScrollIndicator={false}
                                />
                            )}
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20, alignItems: 'center' }}>

                            {/* Back Button */}
                            <TouchableOpacity onPress={() => setSelectedCert(null)} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                                <Text style={styles.backText}>Back to List</Text>
                            </TouchableOpacity>

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
                                        <Text style={styles.recipientName}>{selectedCert.studentName}</Text>




                                        <Text style={styles.bodyText}>
                                            For outstanding contribution and dedication to the
                                        </Text>

                                        <TouchableOpacity onPress={() => {
                                            onClose();
                                            router.push(`/activity-detail-student?activityId=${selectedCert.activityId}&isRegistered=true&enrollmentStatus=APPROVED`);
                                        }}>
                                            <Text style={styles.programName} numberOfLines={2}>
                                                {selectedCert.activityTitle?.toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>

                                        <Text style={styles.activityIdText}>(Activity ID: {selectedCert.activityId})</Text>



                                        <View style={styles.statsContainer}>
                                            <View style={styles.statItem}>
                                                <MaterialCommunityIcons name="clock-time-four-outline" size={20} color="#888" />
                                                <Text style={styles.statText}>{selectedCert.ctxhHours} Hours</Text>
                                            </View>
                                            <View style={styles.verticalLine} />
                                            <View style={styles.statItem}>
                                                <MaterialCommunityIcons name="office-building" size={20} color="#888" />
                                                <Text style={styles.statText}>{selectedCert.organizationName || 'Organization'}</Text>
                                            </View>
                                        </View>

                                        {/* Signature Section */}
                                        <View style={styles.footerRow}>
                                            <View style={styles.signatureBlock}>
                                                <Text style={styles.signatureText}>{selectedCert.organizationName || selectedCert.representativeName}</Text>
                                                <View style={styles.line} />
                                                <Text style={styles.signLabel}>Representative</Text>
                                            </View>

                                            {/* Gold Seal */}
                                            <View style={styles.sealContainer}>
                                                <MaterialCommunityIcons name="seal" size={45} color="#C5A059" />
                                                <Text style={styles.sealText}>{new Date(selectedCert.issuedDate).getFullYear()}</Text>
                                            </View>

                                            <View style={styles.signatureBlock}>
                                                <Text style={styles.dateText}>{new Date(selectedCert.issuedDate).toLocaleDateString()}</Text>
                                                <View style={styles.line} />
                                                <Text style={styles.signLabel}>Issued Date</Text>
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
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    modalActions: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        right: 20,
        zIndex: 50,
    },
    closeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        padding: 8,
    },

    // List Styles
    listContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 20,
        height: '70%',
        padding: 20,
    },
    listHeaderTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    listDivider: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 10,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    listIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FFF8E1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    listContent: {
        flex: 1,
    },
    listTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    listSub: {
        fontSize: 12,
        color: '#888',
    },
    emptyView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        marginTop: 10,
        fontSize: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginLeft: 20,
        marginBottom: 10,
    },
    backText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },

    // Capture Container (Reuse)
    captureContainer: {
        marginBottom: 30,
        backgroundColor: 'transparent',
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
        fontFamily: 'PlayfairDisplay_700Bold_Italic',
        marginBottom: 15,
        textAlign: 'center',
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
        marginBottom: 5, // Reduced to make space for ID
        letterSpacing: 1,
        textAlign: 'center',
    },
    activityIdText: {
        fontSize: 10,
        color: '#999',
        textAlign: 'center',
        marginBottom: 20,
        fontStyle: 'italic',
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
        fontSize: 12,
    },

    // Footer
    footerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    signatureBlock: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 5, // Reduced padding to give more width
    },
    signatureText: {
        fontSize: 24, // Larger for signature look
        fontFamily: 'GreatVibes_400Regular',
        color: '#2c3e50',
        marginBottom: 0,
        textAlign: 'center',
        minHeight: 35, // Ensure space is reserved even if empty momentarily
    },
    dateText: {
        fontSize: 14,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: '#2c3e50',
        marginBottom: 0,
        textAlign: 'center',
        fontWeight: 'bold',
        minHeight: 35,
    },
    line: {
        height: 1,
        backgroundColor: '#333',
        width: '100%',
        marginBottom: 5,
    },
    signLabel: {
        fontSize: 8, // Smaller to prevent wrap
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 0.5, // Reduced spacing
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
