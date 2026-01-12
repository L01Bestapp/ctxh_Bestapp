import React, { useState, useEffect } from 'react';
import { Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function HeaderAvatar() {
    const router = useRouter();
    const { token, user } = useAuth();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token && user) {
            // Sync local state with context immediately to show updates fast
            if (user.avatarUrl && user.avatarUrl !== avatarUrl) {
                setAvatarUrl(user.avatarUrl);
            }
            fetchAvatar();
        }
    }, [token, user]);

    const fetchAvatar = async () => {
        try {
            // Determine endpoint based on role
            // user.role from AuthContext is usually 'STUDENT', 'ORGANIZATION', 'ADMIN' (uppercase or lowercase?)
            // The mapTokenToUser usually normalizes it. Let's assume standard values.

            const role = user?.role?.toUpperCase();
            let url = '';

            if (role === 'STUDENT') {
                url = 'https://marg-astonishing-matthias.ngrok-free.dev/api/v1/students/my-profile';
            } else if (role === 'ORGANIZATION') {
                url = 'https://marg-astonishing-matthias.ngrok-free.dev/api/v1/organization/profile';
            } else {
                setLoading(false);
                return;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await response.json();

            if (json.success && json.data) {
                setAvatarUrl(json.data.avatarUrl);
            }
        } catch (error) {
            console.error("HeaderAvatar Fetch Error:", error);
        } finally {
            setLoading(false);
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
            {/* If loading, assume we might have cached avatarUrl from user object as placeholder? 
                 Actually, just show user.avatarUrl (from token) as fallback while loading fresh one, or default. 
             */}
            <Image
                source={
                    avatarUrl ? { uri: avatarUrl } :
                        (user?.avatarUrl ? { uri: user.avatarUrl } : defaultImage)
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
