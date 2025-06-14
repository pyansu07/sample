'use client';

import { useAuth0 } from '@auth0/auth0-react';

export const useAuth = () => {
    const {
        isAuthenticated,
        isLoading,
        user,
        loginWithRedirect,
        logout,
        getAccessTokenSilently,
    } = useAuth0();

    const login = () => {
        loginWithRedirect();
    };

    const handleLogout = () => {
        logout({
            logoutParams: {
                returnTo: window.location.origin,
            },
        });
    };

    return {
        isAuthenticated,
        isLoading,
        user,
        login,
        logout: handleLogout,
        getAccessToken: getAccessTokenSilently,
    };
}; 