import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme'; // Assuming this exists or using inline

const { width } = Dimensions.get('window');

const onboardingSteps = [
    {
        step: '1/3',
        image: require('@/assets/images/ob1.png'),
        subtitle: 'Choose Your Activity',
        description: 'Every act of kindness begins with a simple choice. Join an event, help your community, or support a cause that inspires you. Choose what speaks to your heart, and make the world brighter together.'
    },
    {
        step: '2/3',
        image: require('@/assets/images/ob2.png'),
        subtitle: 'Complete Registration',
        description: "You've found an activity that speaks to your heart — now it's time to make it official. Fill in a few quick details and get ready to make a difference. Together, we burn with heart."
    },
    {
        step: '3/3',
        image: require('@/assets/images/ob3.png'),
        subtitle: 'Check In\n&\nJoin the Action!',
        description: "You're all set! Just scan the QR code with the organizer to confirm your spot. From here, every smile, every effort, and every moment counts. Let's burn with heart and make this day meaningful."
    }
];

export default function OnboardingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [currentStep, setCurrentStep] = React.useState(0);

    const handleSkip = () => {
        router.replace('/(tabs)/home');
    };

    const handleNext = () => {
        if (currentStep < onboardingSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            router.replace('/(tabs)/home');
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const currentData = onboardingSteps[currentStep];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.stepText}>{currentData.step}</Text>
                <Image
                    source={require('@/assets/images/logo_univolun.png')}
                    style={styles.headerLogo}
                    contentFit="contain"
                />
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.mainTitle}>UNI VOLUNTEER APP</Text>

                <View style={styles.imageContainer}>
                    <Image
                        source={currentData.image}
                        style={styles.mainImage}
                        contentFit="contain"
                    />
                </View>

                <Text style={styles.subtitle}>{currentData.subtitle}</Text>
                <Text style={styles.description}>
                    {currentData.description}
                </Text>
            </View>

            {/* Footer */}
            <View style={{ paddingBottom: insets.bottom + 20 }}>
                <View style={styles.footer}>
                    {/* Prev Button */}
                    {currentStep > 0 ? (
                        <TouchableOpacity style={styles.prevButton} onPress={handlePrev}>
                            <Text style={styles.prevButtonText}>Prev</Text>
                        </TouchableOpacity>
                    ) : null}

                    {/* Paginator */}
                    <View style={styles.paginator}>
                        {onboardingSteps.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    currentStep === index && styles.activeDot
                                ]}
                            />
                        ))}
                    </View>

                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextButtonText}>
                            {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center', // Center content (Logo)
        alignItems: 'center',
        height: 60, // Increased height
        marginBottom: 20,
        position: 'relative',
    },
    stepText: {
        position: 'absolute',
        left: 0,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    headerLogo: {
        width: 180,
        height: 80,
    },
    skipButton: {
        position: 'absolute',
        right: 0,
    },
    skipText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainTitle: {
        fontSize: 22,
        fontWeight: '900', // Extra bold
        color: '#000',
        marginBottom: 30,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    imageContainer: {
        width: width * 0.8,
        height: width * 0.8,
        marginBottom: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    subtitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center', // Center content (Paginator)
        alignItems: 'center',
        position: 'relative',
        height: 50,
    },
    prevButton: {
        position: 'absolute',
        left: 0,
        height: '100%',
        justifyContent: 'center',
    },
    prevButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#9E9E9E',
        // Note: In provided design, "Prev" looks greyish/light text.
        // Let's use a grey color.
    },
    paginator: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#E0E0E0',
    },
    activeDot: {
        backgroundColor: '#333',
        width: 25,
    },
    nextButton: {
        position: 'absolute',
        right: 0,
        height: '100%',
        justifyContent: 'center',
    },
    nextButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E53935',
    }
});
