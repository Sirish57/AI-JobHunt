import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null); // We'll still use token for internal state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                // Request backend to verify the cookie
                const response = await axios.get('http://localhost:8000/auth/check', {
                    withCredentials: true, // This ensures cookies are sent with the request
                });

                if (response.status === 200) {
                    setToken('valid'); // Set a valid token (can be just a placeholder)
                    setUser(response.data); // Set the user data (e.g., from backend)
                }
            } catch (err) {
                console.error("Token verification failed:", err);
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, []); // We don't need the token dependency here, as we verify it directly with the backend

    const login = async (dummyToken, userData) => {
        // Setting the token and user data in context
        setToken(dummyToken); // The dummy token (or just set as valid)
        setUser(userData); // The user data (email, name, etc.)

        // No need to store in localStorage anymore
    };

    const logout = () => {
        setToken(null);
        setUser(null);

        // Optionally, you can clear cookies on logout by calling a backend logout endpoint
        // await axios.post('http://localhost:8000/auth/logout', {}, { withCredentials: true });
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token, // User is authenticated if token is valid
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
