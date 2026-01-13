export const Config = {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_URL ? `${process.env.EXPO_PUBLIC_API_URL}/api/v1` : 'http://localhost:8080/api/v1',
};
