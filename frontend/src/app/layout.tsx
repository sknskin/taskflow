import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/providers/AuthProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TaskFlow — Task & Schedule Management',
  description: 'Jira-style task and schedule management app with calendar and kanban board',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <head>
        {/* Material Symbols 아이콘 */}
        {/* Material Symbols Icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-sans antialiased selection:bg-primary-fixed-dim">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
