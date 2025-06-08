'use client';

import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { logout, isAuthenticated, user } = useAuth();
    const router = useRouter();

    return (
        <nav className="glass-card sticky top-0 z-50 mb-4">
            <div className="mobile-container">
                <div className="flex flex-col space-y-2">
                    <Link
                        href="/"
                        className="text-xl font-bold gradient-text text-center"
                    >
                        ChatGPT Clone
                    </Link>
                    <div className="flex flex-col space-y-2">
                        {isAuthenticated ? (
                            <>
                                <span className="mobile-text text-center text-gray-700 dark:text-gray-200">
                                    Welcome, {user?.name}
                                </span>
                                <button
                                    className="animated-button bg-gradient-to-r from-red-500 to-pink-500 text-white"
                                    onClick={() => {
                                        logout();
                                        router.push('/login');
                                    }}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button
                                className="animated-button bg-gradient-to-r from-emerald-500 to-teal-500 text-blue-500"
                                onClick={() => router.push('/login')}
                            >
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
} 