import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const geist = Geist({
    subsets: ['latin'],
    variable: '--font-geist',
});

export const metadata: Metadata = {
    title: 'tinystatus — AI-Powered Uptime Intelligence',
    description: 'Paste a URL, get a public status page that monitors it, and let AI explain every incident in plain English.',
    openGraph: {
        title: 'tinystatus — AI-Powered Uptime Intelligence',
        description: 'Paste a URL, get a public status page that monitors it, and let AI explain every incident.',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body className={geist.variable} suppressHydrationWarning>{children}</body>
            </html>
        </ClerkProvider>
    );
}
