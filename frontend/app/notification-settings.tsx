import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NotificationSettingsScreen() {
    const router = useRouter();

    const [generalNotification, setGeneralNotification] = useState(true);
    const [sound, setSound] = useState(true);
    const [vibrate, setVibrate] = useState(true);
    const [appUpdates, setAppUpdates] = useState(false);
    const [newTips, setNewTips] = useState(true);

    const ToggleItem = ({ label, value, onValueChange }: { label: string, value: boolean, onValueChange: (val: boolean) => void }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.itemLabel}>{label}</Text>
            <Switch
                trackColor={{ false: "#E0E0E0", true: "#FF455B" }}
                thumbColor={"#FFFFFF"}
                ios_backgroundColor="#E0E0E0"
                onValueChange={onValueChange}
                value={value}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>NOTIFICATIONS</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionHeader}>Common</Text>
                <ToggleItem label="General Notification" value={generalNotification} onValueChange={setGeneralNotification} />
                <ToggleItem label="Sound" value={sound} onValueChange={setSound} />
                <ToggleItem label="Vibrate" value={vibrate} onValueChange={setVibrate} />

                <View style={styles.divider} />

                <Text style={styles.sectionHeader}>System & Services</Text>
                <ToggleItem label="App Updates" value={appUpdates} onValueChange={setAppUpdates} />
                <ToggleItem label="New Tips Available" value={newTips} onValueChange={setNewTips} />
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    backButton: { padding: 8, backgroundColor: '#F5F5F5', borderRadius: 50 },
    headerTitle: { fontSize: 18, fontWeight: '900', color: '#1A237E', letterSpacing: 0.5 },
    content: { padding: 20 },
    sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15, marginTop: 10 },
    itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    itemLabel: { fontSize: 16, color: '#555' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
});
