import React, { useState, useEffect } from 'react';
import { Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function HeaderAvatar() {
    const router = useRouter();
    const { token, user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Only fetch if we are logged in but don't have an avatar URL yet
        // This avoids overwriting a locally-updated avatar with a stale one from the API
        if (token && user && !user.avatarUrl) {
            fetchAvatar();
        }
    }, [token, user?.avatarUrl]);

    const fetchAvatar = async () => {
        try {
            const role = user?.role?.toUpperCase();
            let url = '';

            if (role === 'STUDENT') {
                url = 'https://marg-astonishing-matthias.ngrok-free.dev/api/v1/students/my-profile';
            } else if (role === 'ORGANIZATION') {
                url = 'https://marg-astonishing-matthias.ngrok-free.dev/api/v1/organization/profile';
            } else {
                return;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await response.json();

            if (json.success && json.data && json.data.avatarUrl) {
                // Update the context so everyone gets the new URL
                updateUser({ avatarUrl: json.data.avatarUrl });
            }
        } catch (error) {
            console.error("HeaderAvatar Fetch Error:", error);
        }
    };

    const handlePress = () => {
        const role = user?.role?.toUpperCase();
        if (role === 'STUDENT') {
            router.push('/(tabs-student)/profile');
        } else if (role === 'ORGANIZATION') {
            router.push('/(tabs-org)/profile');
        }
    };

    const defaultImage = user?.role?.toUpperCase() === 'ORGANIZATION'
        ? require('../../assets/images/org_image.png')
        : require('../../assets/images/student_image.png');

    return (
        <TouchableOpacity onPress={handlePress}>
            <Image
                source={
                    user?.avatarUrl
                        ? { uri: user.avatarUrl }
                        : defaultImage
                }
                style={styles.avatar}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#eee'
    }
});
