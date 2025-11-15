import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpaceBackground from "@/components/SpaceBackground";
import CookieBanner from "@/components/CookieBanner";
// import Analytics from "@/components/Analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Reality Radio Network | AI-Powered Music & Artists",
    template: "%s | Reality Radio Network"
  },
  description: "Discover the future of music at Reality Radio Network. 22+ AI-powered artists, 9 radio stations, original albums, and the Persona Adoption Program. Stream live, shop music, and join the revolution.",
  keywords: [
    "AI music",
    "AI artists",
    "internet radio",
    "Reality Radio Network",
    "AI personas",
    "music streaming",
    "buy music online",
    "AI-generated music",
    "independent music",
    "country music",
    "rock music",
    "persona adoption"
  ],
  authors: [{ name: "Alissa M.R. Eldridge" }],
  creator: "Reality Radio Network",
  publisher: "Reality Builders Entertainment Works",
  metadataBase: new URL('https://www.realityradionetwork.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.realityradionetwork.com',
    siteName: 'Reality Radio Network',
    title: 'Reality Radio Network | AI-Powered Music & Artists',
    description: 'The future of music. AI-powered artists, real emotions, authentic sound. Listen live, shop albums, and discover 22+ unique personas.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Reality Radio Network',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reality Radio Network | AI-Powered Music & Artists',
    description: 'The future of music. AI-powered artists, real emotions, authentic sound.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark" />
        <link rel="icon" href="/RRN_logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/RRN_logo.jpg" />
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning={true}>
        <SpaceBackground />
        {/* <Analytics /> */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#00f3ff] focus:text-black focus:rounded-lg focus:font-semibold">
          Skip to main content
        </a>
        <Header />
        <main id="main-content">
          {children}
        </main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
