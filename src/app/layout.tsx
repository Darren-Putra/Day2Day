import { ThemeProvider } from '@/components/layout/ThemeProvider';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Day2Day — Personal College Management System',
  description:
    'Smart schedule management, 24-hour time audit, conflict detection, and Eisenhower matrix prioritization.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-[#3B82F6] relative transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Global Ambient Background */}
          <div className="fixed inset-0 z-[-1] bg-zinc-50 dark:bg-black transition-colors duration-300">
            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
            {/* Ambient Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vh] bg-[#1E3A8A]/10 dark:bg-[#1E3A8A]/15 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vh] bg-[#3B82F6]/5 dark:bg-[#3B82F6]/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
          </div>
          
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
