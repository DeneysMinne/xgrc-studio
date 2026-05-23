import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'XGRC Studio',
  description: 'AI-powered content studio for XGRC Software',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0d1117] text-[#e6edf3] min-h-screen`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-[220px] p-8 min-h-screen overflow-y-auto">
            {children}
          </main>
        </div>
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  )
}
