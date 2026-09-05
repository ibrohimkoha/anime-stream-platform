import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { VIPModal } from '@/components/VIPModal';
import { ParticleCanvas } from '@/components/ParticleCanvas';

export const metadata: Metadata = {
  title: 'Nokori Stream — Anime & VIP Portal',
  description: 'O‘zbekistondagi eng zamonaviy anime striming platformasi va muhokama forumi.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className="antialiased selection:bg-purple-600 selection:text-white">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ParticleCanvas />
              <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </main>
                <Footer />
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
