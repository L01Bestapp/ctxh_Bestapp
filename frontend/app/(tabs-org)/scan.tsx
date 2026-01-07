import { View, Text, StyleSheet } from 'react-native';

export default function OrgScanScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Scan QR Code</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
