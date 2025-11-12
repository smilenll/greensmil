import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import AmplifyClientConfig from "./amplify-client-config";
import { MainNav, Footer } from '@/components/layout';
import { AuthProvider } from '@/contexts/auth-context';
import { CookieConsent } from '@/components/ui/cookie-consent';
import { GlobalSplashScreen } from '@/components/ui/loading-spinner';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmiL",
  description: "Build amazing web experiences with modern technology. Fast, secure, and scalable solutions.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <GlobalSplashScreen />
        <AuthProvider>
          <AmplifyClientConfig />
          <div className="min-h-screen flex flex-col">
            <MainNav />
            <main className="grow">
              {children}
            </main>
            <Footer />
          </div>
          <CookieConsent />
          <Toaster richColors position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
