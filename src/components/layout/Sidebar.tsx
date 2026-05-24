'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PenTool, History, Calendar, Settings, ChevronLeft, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

const navItems = [
  { href: '/create',   icon: PenTool,   label: 'Create Post' },
  { href: '/history',  icon: History,   label: 'History' },
  { href: '/schedule', icon: Calendar,  label: 'Schedule' },
  { href: '/settings', icon: Settings,  label: 'Settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored === 'true') setCollapsed(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed))
    document.documentElement.style.setProperty(
      '--sidebar-w',
      collapsed ? '56px' : '220px'
    )
  }, [collapsed])

  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : 220 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-sidebar border-r border-faint flex flex-col z-50 overflow-hidden"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b border-faint flex items-center gap-3 min-h-[65px]">
        <div className="flex-shrink-0 w-7 h-7 rounded-md bg-accent flex items-center justify-center">
          <span className="text-white font-bold text-xs">X</span>
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <div className="text-glow font-bold text-base tracking-wide leading-none">XGRC</div>
              <div className="text-ink text-xs mt-0.5 font-medium opacity-70">Studio</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5" role="navigation">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href === '/create' && pathname === '/')
          return (
            <Link
              key={href}
              href={href}
              aria-label={collapsed ? label : undefined}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-colors relative group',
                isActive
                  ? 'bg-accent text-white'
                  : 'text-dim hover:text-ink hover:bg-faint'
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Tooltip when collapsed */}
              {collapsed && (
                <div
                  role="tooltip"
                  className="absolute left-full ml-3 px-2 py-1 bg-elevated border border-edge rounded-md text-xs text-ink whitespace-nowrap
                             opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg"
                >
                  {label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer controls */}
      <div className="px-2 py-3 border-t border-faint space-y-0.5">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="flex items-center gap-3 w-full px-2.5 py-2.5 rounded-lg text-dim hover:text-ink hover:bg-faint transition-colors text-sm"
        >
          {theme === 'dark' ? <Sun size={18} className="flex-shrink-0" /> : <Moon size={18} className="flex-shrink-0" />}
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className="flex items-center gap-3 w-full px-2.5 py-2.5 rounded-lg text-dim hover:text-ink hover:bg-faint transition-colors text-sm"
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </motion.div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-dim text-xs px-2.5 pt-1 whitespace-nowrap"
            >
              Driving Compliance®
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  )
}
