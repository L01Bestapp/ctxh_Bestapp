import { StyleSheet, View, Text } from 'react-native';

export default function OrgEventsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Manage Events</Text>
            <Text style={styles.subtitle}>Here you can create and manage events.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
});
