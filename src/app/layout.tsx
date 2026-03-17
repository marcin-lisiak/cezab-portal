import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CEZAB Portal",
  description: "Baza wiedzy, instrukcje, certyfikaty i wsparcie techniczne.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b bg-white/70 backdrop-blur">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex gap-4">
            <Link href="/" className="font-semibold mr-4">CEZAB</Link>
            <Link href="/katalog">Katalog</Link>
            <Link href="/instrukcje">Instrukcje</Link>
            <Link href="/certyfikaty">Certyfikaty</Link>
            <Link href="/moje-produkty">Moje produkty</Link>
            <Link href="/moje-zgloszenia">Moje zgłoszenia</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
