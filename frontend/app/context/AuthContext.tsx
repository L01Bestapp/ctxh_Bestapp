import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface User {
    id: string | number;
    email: string;
    role: 'student' | 'organization' | 'admin';
    name?: string;
    organizationId?: number; // Specific for organizations
    sub?: string;
    // Add other fields from token if needed
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, userData?: any) => Promise<void>;
    logout: () => Promise<void>;
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
            const storedEmail = await AsyncStorage.getItem('userEmail'); // Retrieve stored email

            if (storedToken) {
                const userData = parseJwt(storedToken);
                if (userData) {
                    setToken(storedToken);
                    // Merge stored email if token doesn't have it
                    const decodedWithEmail = {
                        ...userData,
                        email: storedEmail || userData.email || userData.sub
                    };
                    setUser(mapTokenToUser(decodedWithEmail));
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
            name: decoded.name || decoded.fullName
        };
    };

    const login = async (newToken: string, extraData?: any) => {
        try {
            await AsyncStorage.setItem('accessToken', newToken);

            // Persist email if provided
            if (extraData?.email) {
                await AsyncStorage.setItem('userEmail', extraData.email);
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
            } else {
                Alert.alert("Login Error", "Invalid token received.");
            }
        } catch (error) {
            console.error("Login Error:", error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('accessToken');
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
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
