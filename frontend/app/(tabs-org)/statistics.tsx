
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function OrgStatisticsScreen() {
    const [selectedMonth, setSelectedMonth] = useState('This Month');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    // Mock Filter States
    const [tempTime, setTempTime] = useState('This Month');
    const [selectedTypes, setSelectedTypes] = useState<string[]>(['All']);

    // Mock Data
    const cardData = [
        {
            title: 'Activity',
            icon: 'pulse-outline' as const,
            image: require('../../assets/images/ac_card.png'),
            value: '2',
            label: 'created',
            bgColor: '#90CAF9', // Light Blue
            textColor: '#1565C0',
        },
        {
            title: 'Student',
            icon: 'people-outline' as const,
            image: require('../../assets/images/student_card.png'),
            value: '100',
            label: 'approved',
            bgColor: '#EF9A9A', // Light Red
            textColor: '#C62828',
        },
        {
            title: 'HOUR',
            icon: 'hourglass-outline' as const,
            image: require('../../assets/images/hour_card.png'),
            value: '250',
            label: 'held',
            bgColor: '#CE93D8', // Light Purple
            textColor: '#6A1B9A',
        },
    ];

    const chartConfig = {
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`, // Softer gray labels
        strokeWidth: 3,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
        propsForLabels: {
            fontSize: 11,
            fontWeight: '600'
        },
        propsForBackgroundLines: {
            strokeDasharray: "4", // Dashed lines
            stroke: "#eee"
        }
    };

    const registrationData = {
        labels: ["W1", "W2", "W3", "W4"],
        datasets: [
            {
                data: [1, 5, 2, 4],
                color: (opacity = 1) => `rgba(41, 121, 255, ${opacity})`, //  #2979FF (Vibrant Blue)
                strokeWidth: 3,
            },
            {
                data: [1, 2, 5, 3],
                color: (opacity = 1) => `rgba(255, 23, 68, ${opacity})`, // #FF1744 (Vibrant Red)
                strokeWidth: 3
            }
        ],
        legend: ["Registrations", "Check-ins"]
    };

    const pieData = [
        { name: "Participated", population: 60, color: "#00BFA5", legendFontColor: "#7F7F7F", legendFontSize: 11 }, // Teal Accent
        { name: "Not Participated", population: 40, color: "#CFD8DC", legendFontColor: "#7F7F7F", legendFontSize: 11 } // Blue Gray
    ];

    const toggleType = (type: string) => {
        if (type === 'All') {
            setSelectedTypes(['All']);
            return;
        }
        let newTypes = selectedTypes.filter(t => t !== 'All');
        if (newTypes.includes(type)) {
            newTypes = newTypes.filter(t => t !== type);
        } else {
            newTypes.push(type);
        }
        if (newTypes.length === 0) newTypes = ['All'];
        setSelectedTypes(newTypes);
    };

    const applyFilter = () => {
        setSelectedMonth(tempTime);
        setIsFilterVisible(false);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuButton}>
                    <Ionicons name="menu" size={24} color="#333" />
                </TouchableOpacity>
                <Image source={require('../../assets/images/logo_univolun.png')} style={styles.logo} resizeMode="contain" />
                <Image source={require('../../assets/images/org_image.png')} style={styles.avatar} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.pageTitle}>GENERAL STATISTICS</Text>

                {/* Filter Row */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsFilterVisible(true)}>
                        <Ionicons name="calendar-outline" size={18} color="#333" style={{ marginRight: 8 }} />
                        <Text style={styles.dropdownText}>{selectedMonth}</Text>
                        <Ionicons name="chevron-down" size={18} color="#666" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.filterButton} onPress={() => setIsFilterVisible(true)}>
                        <Text style={styles.filterText}>Filter</Text>
                        <Ionicons name="filter" size={16} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Cards Row - Fixed Layout (No Scroll) */}
                <View style={styles.cardsContainer}>
                    {cardData.map((item, index) => (
                        <View key={index} style={[styles.card, { backgroundColor: item.bgColor }]}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Ionicons name={item.icon} size={18} color="#fff" />
                            </View>
                            <View style={styles.cardContent}>
                                <Image source={item.image} style={styles.cardImage} resizeMode="contain" />
                            </View>
                            <View style={styles.cardFooter}>
                                <Text style={styles.cardValue}>{item.value}</Text>
                                <Text style={styles.cardLabel}>{item.label}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Charts - Full Width for better visibility */}
                {/* Line Chart */}
                <View style={styles.chartBoxFull}>
                    <View style={styles.chartHeaderRow}>
                        <Text style={styles.chartTitle}>Registration Trend Over Time</Text>
                        <View style={styles.legendContainer}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                                <View style={{ width: 10, height: 3, borderRadius: 2, backgroundColor: '#2979FF', marginRight: 4 }} />
                                <Text style={{ fontSize: 10, color: '#555' }}>Reg</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 10, height: 3, borderRadius: 2, backgroundColor: '#FF1744', marginRight: 4 }} />
                                <Text style={{ fontSize: 10, color: '#555' }}>Check-in</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ alignItems: 'center', overflow: 'hidden' }}>
                        <LineChart
                            data={registrationData}
                            width={width - 48} // Slightly narrower to fit padding
                            height={220}
                            chartConfig={{
                                ...chartConfig,
                                propsForDots: { r: "4", strokeWidth: "2", stroke: "#fff" },
                            }}
                            bezier
                            withDots={true}
                            withInnerLines={true}
                            withOuterLines={false}
                            withVerticalLines={false}
                            withHorizontalLabels={true}
                            fromZero
                            style={{ marginVertical: 8, borderRadius: 16, paddingRight: 30 }} // Padding right to show last label
                        />
                    </View>
                </View>

                {/* Pie Chart */}
                <View style={styles.chartBoxFull}>
                    <Text style={[styles.chartTitle, { marginBottom: 10 }]}>Average Participation Rate</Text>
                    <View style={{ alignItems: 'center', justifyContent: 'center', height: 220, position: 'relative' }}>
                        <PieChart
                            data={pieData}
                            width={width - 50}
                            height={220}
                            chartConfig={chartConfig}
                            accessor={"population"}
                            backgroundColor={"transparent"}
                            paddingLeft={"0"}
                            center={[(width - 50) / 4, 0]} // Center based on available width
                            absolute={false}
                            hasLegend={false}
                        />
                        {/* Donut Hole (White Circle) + Label */}
                        <View style={{
                            position: 'absolute',
                            width: 100, height: 100, borderRadius: 50,
                            backgroundColor: '#fff', // Creates the "Hole"
                            justifyContent: 'center', alignItems: 'center',
                            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2
                        }}>
                            <Text style={{ fontWeight: '900', fontSize: 28, color: '#00BFA5' }}>60%</Text>
                            <Text style={{ fontSize: 10, color: '#888', marginTop: -2 }}>Rate</Text>
                        </View>
                    </View>

                    <View style={styles.pieLegend}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#00BFA5', marginRight: 6 }} />
                            <Text style={{ fontSize: 12, color: '#333', fontWeight: '600' }}>Participated</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#CFD8DC', marginRight: 6 }} />
                            <Text style={{ fontSize: 12, color: '#333', fontWeight: '600' }}>Not Participated</Text>
                        </View>
                    </View>
                </View>

                {/* Rankings */}
                <View style={styles.rankingContainer}>
                    {/* Activity Ranking */}
                    <View style={[styles.rankingBox, styles.rankingBoxPop]}>
                        <View style={[styles.rankingHeader, { backgroundColor: '#FF7043' }]}>
                            <Ionicons name="trophy" size={16} color="#fff" style={{ marginRight: 5 }} />
                            <Text style={styles.rankingTitle}>TOP ACTIVITIES</Text>
                        </View>
                        <View style={styles.rankingList}>
                            <View style={styles.rankItemRow}>
                                <Text style={styles.rankIndex}>1</Text>
                                <Text style={styles.rankText} numberOfLines={1}>Green Summer (300)</Text>
                            </View>
                            <View style={styles.rankItemRow}>
                                <Text style={styles.rankIndex}>2</Text>
                                <Text style={styles.rankText} numberOfLines={1}>Exam Support (250)</Text>
                            </View>
                            <View style={styles.rankItemRow}>
                                <Text style={styles.rankIndex}>3</Text>
                                <Text style={styles.rankText} numberOfLines={1}>Book Donation (180)</Text>
                            </View>
                        </View>
                    </View>

                    {/* Student Ranking */}
                    <View style={[styles.rankingBox, styles.rankingBoxPop]}>
                        <View style={[styles.rankingHeader, { backgroundColor: '#43A047' }]}>
                            <Ionicons name="ribbon" size={16} color="#fff" style={{ marginRight: 5 }} />
                            <Text style={styles.rankingTitle}>TOP STUDENTS</Text>
                        </View>
                        <View style={styles.rankingList}>
                            <View style={styles.rankItemRow}>
                                <Text style={styles.rankIndex}>1</Text>
                                <Text style={styles.rankText} numberOfLines={1}>Tran Thi Be (20h)</Text>
                            </View>
                            <View style={styles.rankItemRow}>
                                <Text style={styles.rankIndex}>2</Text>
                                <Text style={styles.rankText} numberOfLines={1}>Le Van Khiem (18h)</Text>
                            </View>
                            <View style={styles.rankItemRow}>
                                <Text style={styles.rankIndex}>3</Text>
                                <Text style={styles.rankText} numberOfLines={1}>Pham Duy Khoi (15h)</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Filter Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isFilterVisible}
                onRequestClose={() => setIsFilterVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsFilterVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Filter Statistics</Text>

                                <Text style={styles.sectionLabel}>Time Period</Text>
                                <View style={styles.chipRow}>
                                    {['This Week', 'This Month', 'Last Month', 'This Year'].map(t => (
                                        <TouchableOpacity
                                            key={t}
                                            style={[styles.chip, tempTime === t && styles.chipSelected]}
                                            onPress={() => setTempTime(t)}
                                        >
                                            <Text style={[styles.chipText, tempTime === t && styles.chipTextSelected]}>{t}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.sectionLabel}>Activity Type</Text>
                                <View style={styles.chipRow}>
                                    {['All', 'Education', 'Environment', 'Social'].map(t => (
                                        <TouchableOpacity
                                            key={t}
                                            style={[styles.chip, selectedTypes.includes(t) && styles.chipSelected]}
                                            onPress={() => toggleType(t)}
                                        >
                                            <Text style={[styles.chipText, selectedTypes.includes(t) && styles.chipTextSelected]}>{t}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity style={styles.applyButton} onPress={applyFilter}>
                                    <Text style={styles.applyButtonText}>Apply Filter</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
    menuButton: { padding: 5, backgroundColor: '#F5F5F5', borderRadius: 50 },
    logo: { width: 100, height: 40 },
    avatar: { width: 35, height: 35, borderRadius: 17.5 },

    scrollContent: { padding: 20, paddingBottom: 50 },
    pageTitle: { fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 20, color: '#1A237E' },

    filterContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 25 },
    dropdownButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, borderWidth: 1, borderColor: '#eee' },
    dropdownText: { fontSize: 14, fontWeight: '600', color: '#333' },
    filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 25 },
    filterText: { fontSize: 14, fontWeight: '500', color: '#333', marginRight: 5 },

    // Fixed Cards Container
    cardsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    // One third width minus gap
    card: { width: (width - 40 - 20) / 3, height: 140, borderRadius: 16, padding: 8, justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
    cardContent: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    cardImage: { width: 80, height: 60 }, // Increased size
    cardFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
    cardValue: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    cardLabel: { fontSize: 8, color: 'rgba(255,255,255,0.9)', textAlign: 'right', marginLeft: 2, marginBottom: 2 },

    // Full Width Charts
    chartBoxFull: { width: '100%', backgroundColor: '#fff', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    chartTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    legendContainer: { flexDirection: 'row', gap: 8 },
    pieLegend: { marginTop: 5, flexDirection: 'row', justifyContent: 'center', gap: 15 },

    rankingContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    rankingBox: { width: (width - 50) / 2, borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
    rankingBoxPop: { shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    rankingHeader: { paddingVertical: 8, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    rankingTitle: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
    rankingList: { padding: 10 },
    rankItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    rankIndex: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#eee', textAlign: 'center', textAlignVertical: 'center', fontSize: 9, fontWeight: 'bold', marginRight: 6, color: '#555' },
    rankText: { fontSize: 10, color: '#333', fontWeight: '600', flex: 1 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, minHeight: 350 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    sectionLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 10, marginTop: 10 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#eee' },
    chipSelected: { backgroundColor: '#E3F2FD', borderColor: '#2196F3' },
    chipText: { fontSize: 12, color: '#666' },
    chipTextSelected: { color: '#2196F3', fontWeight: 'bold' },
    applyButton: { backgroundColor: '#2196F3', paddingVertical: 15, borderRadius: 15, alignItems: 'center', marginTop: 30 },
    applyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
