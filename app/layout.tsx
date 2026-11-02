import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'YT Niches · YouTube Channels & Viral Niches Directory',
  description: 'Track 6,800+ YouTube channels across 2,700+ niches with estimated RPM, revenue analytics, and 18,000+ viral video swipe files.',
  metadataBase: new URL('https://ytniches.com'),
  alternates: {
    canonical: 'https://ytniches.com/',
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
  openGraph: {
    title: 'YT Niches · YouTube Channels & Viral Niches Directory',
    description: 'Track 6,800+ YouTube channels across 2,700+ niches with estimated RPM and viral swipe files.',
    url: 'https://ytniches.com/',
    siteName: 'YT Niches',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YT Niches · YouTube Channels & Viral Niches Directory',
    description: 'Track 6,800+ YouTube channels across 2,700+ niches with estimated RPM and viral swipe files.',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" className={`${fontSans.variable} scroll-smooth`}>
      <head>
        {/* Preconnect & DNS-Prefetch Resource Hints for YouTube CDN Assets */}
        <link rel="preconnect" href="https://yt3.ggpht.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://yt3.googleusercontent.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://yt3.ggpht.com" />
        <link rel="dns-prefetch" href="https://yt3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('yt_theme') || localStorage.getItem('nv_theme');
                if (t === 'light' || t === 'dark') {
                  document.documentElement.setAttribute('data-theme', t);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <ToastProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
