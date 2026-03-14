import type { Metadata } from 'next';
import Link from 'next/link';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title:       'Job Intelligence Platform',
  description: 'Real-time job market insights — trending skills, salary data, and hiring velocity',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: 'var(--bg-base)' }}>
        {/* Nav */}
        <nav style={{
          background: 'rgba(6,13,26,0.85)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div style={{
                  height: 30, width: 30, borderRadius: 8,
                  background: 'linear-gradient(135deg, #1d4ed8, #0891b2)',
                  boxShadow: '0 0 12px rgba(0,212,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg style={{ height: 16, width: 16, color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }} className="gradient-text">
                  JobIntel
                </span>
              </Link>

              <div className="flex items-center gap-6 text-sm">
                <Link href="/" style={{ color: 'var(--text-2)', transition: 'color 0.15s' }}
                  className="hover:text-white">Jobs</Link>
                <Link href="/analytics" style={{ color: 'var(--text-2)', transition: 'color 0.15s' }}
                  className="hover:text-white">Analytics</Link>
                <div style={{
                  height: 20, width: 1, background: 'var(--border)',
                }} />
                <span style={{
                  fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.1em',
                  textTransform: 'uppercase', fontWeight: 600,
                }}>
                  Live
                </span>
              </div>
            </div>
          </div>
        </nav>

        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
