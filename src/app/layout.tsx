import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'XGRC Studio',
  description: 'AI-powered content studio for XGRC Software',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      {/* Prevent flash of wrong theme */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.add('light');document.documentElement.classList.remove('dark');}})();` }} />
      </head>
      <body className={`${inter.className} bg-base text-ink min-h-screen`}>
        <ThemeProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main
              className="flex-1 p-8 min-h-screen overflow-y-auto transition-[margin] duration-250"
              style={{ marginLeft: 'var(--sidebar-w, 220px)' }}
            >
              {children}
            </main>
          </div>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
