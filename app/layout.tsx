import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Modern Expense Tracker & Financial Analytics',
  description: 'Track your personal expenses, visualize spending habits, set budgets, and take control of your financial freedom.',
  keywords: ['expense tracker', 'finance dashboard', 'budget management', 'spending analytics', 'vercel expense tracker'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-violet-500 selection:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
