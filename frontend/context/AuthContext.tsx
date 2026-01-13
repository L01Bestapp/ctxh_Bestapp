import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { removeTokenFromBackend } from '@/services/notificationService';
import { Config } from '@/constants/Config';

interface User {
    // ... (keep interface same)
    id: string | number;
    email: string;
    role: 'student' | 'organization' | 'admin';
    name?: string;
    organizationId?: number; // Specific for organizations
    sub?: string;
    avatarUrl?: string;
    // Add other fields from token if needed
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, userData?: any) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to decode JWT without external libraries
const parseJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to parse JWT", e);
        return null;
    }
};

// Polyfill for atob if needed (React Native might need this)
// @ts-ignore
global.atob = global.atob || ((input: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = input.replace(/=+$/, '');
    let output = '';

    if (str.length % 4 == 1) {
        throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (let bc = 0, bs = 0, buffer, i = 0;
        buffer = str.charAt(i++);

        ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
            bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
        buffer = chars.indexOf(buffer);
    }

    return output;
});


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkToken();
    }, []);

    const checkToken = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('accessToken');
            const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
            const storedEmail = await AsyncStorage.getItem('userEmail'); // Retrieve stored email
            const storedAvatar = await AsyncStorage.getItem('userAvatar'); // Retrieve stored avatar

            if (storedToken) {
                const userData = parseJwt(storedToken);
                if (userData) {
                    setToken(storedToken);
                    // Merge stored email if token doesn't have it
                    const decodedWithData = {
                        ...userData,
                        email: storedEmail || userData.email || userData.sub,
                        avatarUrl: storedAvatar || userData.avatarUrl || userData.image
                    };
                    setUser(mapTokenToUser(decodedWithData));
                    // Notification registration is now handled by useNotifications hook
                }
            }
        } catch (error) {
            console.error("Auth Restore Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Map raw token claims to our User interface
    const mapTokenToUser = (decoded: any): User => {
        // ... (existing implementation details for role/ID)
        const roleFromScope = Array.isArray(decoded.scope) ? decoded.scope[0] : decoded.scope;
        const finalRole = decoded.role || roleFromScope || (decoded.organizationId ? 'organization' : 'student');

        return {
            id: decoded.id || decoded.userId || decoded.sub,
            email: decoded.email || decoded.sub,
            role: finalRole,
            organizationId: decoded.organizationId || (finalRole === 'ORGANIZATION' || finalRole === 'organization' ? (decoded.id || decoded.sub) : undefined),
            name: decoded.name || decoded.fullName,
            avatarUrl: decoded.avatarUrl || decoded.image || decoded.picture
        };
    };

    const updateUser = async (updates: Partial<User>) => {
        if (user) {
            const newUser = { ...user, ...updates };
            setUser(newUser);
            if (updates.avatarUrl) {
                await AsyncStorage.setItem('userAvatar', updates.avatarUrl);
            }
        }
    };

    const login = async (newToken: string, extraData?: any) => {
        try {
            await AsyncStorage.setItem('accessToken', newToken);

            // Persist email if provided
            if (extraData?.email) {
                await AsyncStorage.setItem('userEmail', extraData.email);
            }

            // Persist refresh token if provided
            if (extraData?.refreshToken) {
                await AsyncStorage.setItem('refreshToken', extraData.refreshToken);
            }

            const decodedToken = parseJwt(newToken);
            // console.log("DEBUG: Login User Data:", decodedToken);

            if (decodedToken) {
                setToken(newToken);
                // Merge extra data (email)
                const finalData = {
                    ...decodedToken,
                    email: extraData?.email || decodedToken.email || decodedToken.sub
                };
                setUser(mapTokenToUser(finalData));
                // Notification registration is now handled by useNotifications hook
            } else {
                Alert.alert("Login Error", "Invalid token received.");
            }
        } catch (error) {
            console.error("Login Error:", error);
        }
    };

    const logout = async () => {
        try {
            // Remove notification token first using current token
            if (token) {
                await removeTokenFromBackend(token);
            }

            // Call API to revoke tokens
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    await fetch(`${Config.API_BASE_URL}/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            're-token': refreshToken
                        }
                    });
                } catch (apiError) {
                    console.error("Logout API failed:", apiError);
                    // Continue with local logout regardless of API failure
                }
            }

            // Clear local storage
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            await AsyncStorage.removeItem('userEmail'); // Optional: keep/remove email
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
