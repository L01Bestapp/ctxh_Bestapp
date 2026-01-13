import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Config } from '@/constants/Config';

export default function TestNotificationScreen() {
    const router = useRouter();
    const { token: accessToken } = useAuth();

    // Form State
    const [title, setTitle] = useState('Test Notification');
    const [body, setBody] = useState('This is a test message from Test Screen');
    const [type, setType] = useState('GENERAL');
    const [activityId, setActivityId] = useState('');
    const [customData, setCustomData] = useState('');

    const [loading, setLoading] = useState(false);
    const [lastResponse, setLastResponse] = useState<string | null>(null);

    const NOTIFICATION_TYPES = [
        'GENERAL',
        'REMINDER',
        'ATTENDANCE_COMPLETED',
        'ENROLLMENT_APPROVED'
    ];

    const sendTestNotification = async () => {
        if (!accessToken) {
            Alert.alert("Authentication Error", "Please login first!");
            return;
        }

        if (!title || !body) {
            Alert.alert("Missing Info", "Title and Body are required");
            return;
        }

        setLoading(true);
        setLastResponse(null);

        try {
            const payload = {
                title,
                body,
                type,
                activityId: activityId || undefined, // Send undefined if empty to avoid backend parse error
                customData: customData || undefined
            };

            const response = await fetch(`${Config.API_BASE_URL}/notifications/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });

            const text = await response.text();
            let json = {};
            try {
                json = JSON.parse(text);
            } catch (e) {
                json = { raw: text };
            }

            setLastResponse(JSON.stringify(json, null, 2));

            if (response.ok) {
                Alert.alert("Success", "Notification sent! Check your device.");
            } else {
                Alert.alert("Failed", `Status: ${response.status}`);
            }

        } catch (error: any) {
            console.error("Test Error:", error);
            setLastResponse(`Error: ${error.message}`);
            Alert.alert("Network Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>TEST NOTIFICATIONS</Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
                        <Text style={styles.infoText}>
                            Use this screen to trigger a real Notification from Backend to THIS device via FCM.
                        </Text>
                    </View>

                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Enter notification title"
                    />

                    <Text style={styles.label}>Body *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={body}
                        onChangeText={setBody}
                        placeholder="Enter notification body"
                        multiline
                    />

                    <Text style={styles.label}>Type</Text>
                    <View style={styles.chipsContainer}>
                        {NOTIFICATION_TYPES.map(t => (
                            <TouchableOpacity
                                key={t}
                                style={[styles.chip, type === t && styles.chipActive]}
                                onPress={() => setType(t)}
                            >
                                <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Activity ID (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={activityId}
                        onChangeText={setActivityId}
                        placeholder="e.g. 123"
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Custom Data (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={customData}
                        onChangeText={setCustomData}
                        placeholder="Any string..."
                    />

                    <TouchableOpacity
                        style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                        onPress={sendTestNotification}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="paper-plane-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.sendButtonText}>SEND NOTIFICATION</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {lastResponse && (
                        <View style={styles.responseContainer}>
                            <Text style={styles.responseLabel}>Last API Response:</Text>
                            <Text style={styles.responseText}>{lastResponse}</Text>
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
        padding: 20,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    infoText: {
        marginLeft: 10,
        color: '#1565C0',
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 8,
        marginTop: 10,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#E0E0E0',
        marginRight: 8,
        marginBottom: 8,
    },
    chipActive: {
        backgroundColor: '#FF4058',
    },
    chipText: {
        fontSize: 13,
        color: '#555',
        fontWeight: '600',
    },
    chipTextActive: {
        color: '#fff',
    },
    sendButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    sendButtonDisabled: {
        opacity: 0.7,
        backgroundColor: '#9E9E9E',
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    responseContainer: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#263238',
        borderRadius: 8,
    },
    responseLabel: {
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    responseText: {
        color: '#00E676',
        fontFamily: 'monospace',
        fontSize: 12,
    },
});
