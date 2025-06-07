'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface Auth0ProviderWithNavigateProps {
    children: ReactNode;
}

export const Auth0ProviderWithNavigate = ({ children }: Auth0ProviderWithNavigateProps) => {
    const router = useRouter();

    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_AUTH0_CALLBACK_URL || 'http://localhost:3000';

    useEffect(() => {
        if (!domain || !clientId) {
            console.error('Auth0 configuration is missing:', {
                domain,
                clientId,
                redirectUri
            });
        }
    }, [domain, clientId, redirectUri]);

    if (!domain || !clientId) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="alert alert-danger" role="alert">
                    Auth0 configuration is missing. Please check your .env.local file.
                </div>
            </div>
        );
    }

    const onRedirectCallback = (appState?: { returnTo?: string }) => {
        // Ensure we're using the router to navigate
        router.replace(appState?.returnTo || '/');
    };

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: redirectUri,
            }}
            onRedirectCallback={onRedirectCallback}
        >
            {children}
        </Auth0Provider>
    );
};