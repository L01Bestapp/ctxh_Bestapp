import 'react-native-gesture-handler/jestSetup';

// Mock Expo constants
jest.mock('expo-constants', () => ({
    manifest: { extra: {} },
}));

// Mock Expo Font
jest.mock('expo-font', () => ({
    loadAsync: jest.fn(),
    isLoaded: jest.fn(() => true),
}));

// Mock Expo Asset
jest.mock('expo-asset', () => ({
    Asset: {
        loadAsync: jest.fn(),
        fromModule: jest.fn(() => ({ uri: 'mock-asset-uri' })),
    },
}));

// Mock Expo Router
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }),
    useFocusEffect: jest.fn(),
    useLocalSearchParams: jest.fn(() => ({})),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
    multiGet: jest.fn(),
}));

// Mock Expo Modules Core to prevent runtime.native.ts ReferenceError
jest.mock('expo-modules-core', () => {
    const actual = jest.requireActual('expo-modules-core');
    return {
        ...actual,
        requireNativeModule: jest.fn(),
    };
});

// Mock Expo package
jest.mock('expo', () => ({}));

// Mock Expo Device
jest.mock('expo-device', () => ({
    isDevice: true,
    brand: 'Google',
    manufacturer: 'Google',
    modelName: 'Pixel',
}));

// Mock Expo Notifications
jest.mock('expo-notifications', () => ({
    setNotificationHandler: jest.fn(),
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'mock-push-token' })),
    setNotificationChannelAsync: jest.fn(),
    AndroidNotificationPriority: {
        MAX: 'max',
        HIGH: 'high',
        DEFAULT: 'default',
        LOW: 'low',
        MIN: 'min',
    },
    AndroidImportance: {
        MAX: 5,
        HIGH: 4,
        DEFAULT: 3,
        LOW: 2,
        MIN: 1,
    },
    getLastNotificationResponseAsync: jest.fn(),
    getBadgeCountAsync: jest.fn(() => Promise.resolve(0)),
    setBadgeCountAsync: jest.fn(),
    dismissAllNotificationsAsync: jest.fn(),
}));


