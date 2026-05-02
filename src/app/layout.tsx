import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "PDF Benefits Chatbot",
  description: "AI-powered chatbot for analyzing employee benefits documents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-dark-900 text-white antialiased min-h-screen">
        <div className="fixed inset-0 bg-gradient-radial from-accent-purple/10 via-transparent to-transparent pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-radial from-accent-cyan/5 via-transparent to-transparent pointer-events-none" />
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}

// Made with Bob
