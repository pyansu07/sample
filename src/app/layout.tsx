import type { Metadata, Viewport } from 'next'
import TRPCReactProvider from '../trpc/client'
import { Auth0ProviderWithNavigate } from '@/components/Auth0Provider'
import Navbar from '@/components/Navbar'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@/styles/custom.scss'

export const metadata: Metadata = {
  title: 'ChatGPT Clone',
  description: 'AI-powered chat application',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Auth0ProviderWithNavigate>
          <TRPCReactProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1 mobile-container">
                <div className="animate-fade-in">
                  {children}
                </div>
              </main>
            </div>
          </TRPCReactProvider>
        </Auth0ProviderWithNavigate>
      </body>
    </html>
  )
}
