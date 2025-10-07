import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

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
  authors: [{ name: "Security Training Platform" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

import { Header } from '@/components/Navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-gray-900 text-green-400 min-h-screen`}
      >
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen">
          <Header />
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
