'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PenTool, History, Calendar, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/create', icon: PenTool, label: 'Create Post' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/schedule', icon: Calendar, label: 'Schedule' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-[220px] bg-[#0a1628] border-r border-[#1e2a3a] flex flex-col z-50">
      <div className="px-5 py-6 border-b border-[#1e2a3a]">
        <div className="text-[#00d4ff] font-bold text-xl tracking-wide">XGRC</div>
        <div className="text-[#e6edf3] text-sm mt-0.5 font-medium">Studio</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href === '/create' && pathname === '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#0066ff] text-white'
                  : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#1e2a3a]'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-[#1e2a3a]">
        <p className="text-[#8b949e] text-xs">Driving Compliance®</p>
      </div>
    </aside>
  )
}
