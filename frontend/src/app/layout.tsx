import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import '@/styles/globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { VIPModal } from '@/components/VIPModal';
import { ParticleCanvas } from '@/components/ParticleCanvas';

export const metadata: Metadata = {
  title: 'Nokori Stream — Anime & VIP Portal',
  description: 'O‘zbekistondagi eng zamonaviy anime striming platformasi va muhokama forumi.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#090B10',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased selection:bg-purple-600 selection:text-white">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ParticleCanvas />
              <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-12">
                  {children}
                </main>
                <Footer />
                <MobileNav />
              </div>
              <AuthModal />
              <VIPModal />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
