'use client';

import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { login, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="glass-card w-full">
                <h1 className="text-2xl font-bold gradient-text text-center mb-4">
                    Welcome to ChatGPT Clone
                </h1>
                <p className="mobile-text text-center text-gray-600 dark:text-gray-300 mb-6">
                    Experience the power of AI-powered conversations
                </p>
                <button
                    className="animated-button bg-gradient-to-r from-emerald-500 to-teal-500 text-blue-500"
                    onClick={() => login()}
                >
                    Login with Auth0
                </button>
            </div>
        </div>
    );
} 