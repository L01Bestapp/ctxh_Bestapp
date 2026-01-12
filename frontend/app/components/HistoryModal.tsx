import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Dimensions, StatusBar, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface HistoryModalProps {
    visible: boolean;
    onClose: () => void;
    historyData: any[];
    onItemPress: (item: any) => void;
}

export default function HistoryModal({ visible, onClose, historyData, onItemPress }: HistoryModalProps) {
    if (!visible) return null;

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const isCompleted = item.enrollmentStatus === 'APPROVED' || item.isCompleted;

        return (
            <TouchableOpacity
                style={styles.itemCard}
                onPress={() => onItemPress(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.dateBadge, { backgroundColor: isCompleted ? '#E8F5E9' : '#FFF3E0' }]}>
                    <Text style={[styles.dateText, { color: isCompleted ? '#2E7D32' : '#EF6C00' }]}>
                        {new Date(item.startDateTime).getDate()}
                    </Text>
                    <Text style={[styles.monthText, { color: isCompleted ? '#2E7D32' : '#EF6C00' }]}>
                        {new Date(item.startDateTime).toLocaleString('default', { month: 'short' })}
                    </Text>
                </View>

                <View style={styles.itemContent}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.activityTitle}</Text>
                    <Text style={styles.itemOrg} numberOfLines={1}>{item.organizationName}</Text>
                    <View style={styles.itemFooter}>
                        <View style={styles.tag}>
                            <Ionicons name="time-outline" size={12} color="#666" />
                            <Text style={styles.tagText}>{item.ctxhHours} days</Text>
                        </View>
                        <Text style={[styles.statusText, { color: isCompleted ? '#4CAF50' : '#FF9800' }]}>
                            {item.enrollmentStatus}
                        </Text>
                    </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                {/* Blur Effect Background could be added here */}

                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Activity History</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    {historyData.length > 0 ? (
                        <FlatList
                            data={historyData}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="history" size={60} color="#DDD" />
                            <Text style={styles.emptyText}>No participation history yet.</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#F5F7FA',
        width: '100%',
        height: '85%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingTop: 25,
        paddingBottom: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A237E',
    },
    closeButton: {
        padding: 5,
        backgroundColor: '#F5F5F5',
        borderRadius: 50,
    },
    listContent: {
        padding: 20,
        paddingBottom: 50,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 15,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    dateBadge: {
        width: 50,
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    dateText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    monthText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    itemContent: {
        flex: 1,
        marginRight: 10,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    itemOrg: {
        fontSize: 13,
        color: '#888',
        marginBottom: 8,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 11,
        color: '#666',
        marginLeft: 4,
        fontWeight: '500',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#999',
        fontWeight: '500',
    }
});
