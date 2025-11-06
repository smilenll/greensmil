import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import AmplifyClientConfig from "./amplify-client-config";
import { MainNav, Footer } from '@/components/layout';
import { AuthProvider } from '@/contexts/auth-context';
import { CookieConsent } from '@/components/ui/cookie-consent';

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} antialiased`}
        suppressHydrationWarning={true}
      >
       
        <AuthProvider>
          <AmplifyClientConfig />
          <div className="min-h-screen flex flex-col">
            <MainNav />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
