import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./[locale]/globals.css";
import { Analytics } from '@vercel/analytics/react';
import { ReactNode } from 'react';

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Startup Security Showdown - CTF Game",
  description: "Learn frontend security through gamified challenges. Test your skills against real-world vulnerabilities in a safe environment.",
  keywords: ["cybersecurity", "CTF", "hacking", "frontend security", "web security", "XSS", "JWT", "OWASP"],
  authors: [{ name: "Munganga Thelly" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
  params: { locale = 'en' },
}: Readonly<{
  children: ReactNode;
  params: { locale?: string };
}>) {
  return (
    <html lang={locale} className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-gray-900 text-green-400 min-h-screen`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
