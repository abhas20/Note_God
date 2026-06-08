'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Brain, FileText, MessageSquare, Share2 } from 'lucide-react'

const navItems = [
  {
    href: '/visualise',
    label: 'Visualize',
    icon: Share2,
    color: 'text-indigo-500',
    hoverBg: 'hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20',
    iconAnimation: {
      hover: {
        rotate: 15,
        scale: 1.15,
        transition: { type: 'spring', stiffness: 300 },
      },
    },
  },
  {
    href: '/chatpdf',
    label: 'Chat with PDFs',
    icon: FileText,
    color: 'text-emerald-500',
    hoverBg: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
    iconAnimation: {
      hover: {
        y: -4,
        scale: 1.1,
        transition: {
          type: 'spring',
          stiffness: 300,
          repeat: Infinity,
          repeatType: 'reverse' as const,
          duration: 0.3,
        },
      },
    },
  },
  {
    href: '/chat',
    label: 'Community Chat',
    icon: MessageSquare,
    color: 'text-rose-500',
    hoverBg: 'hover:bg-rose-50/50 dark:hover:bg-rose-950/20',
    iconAnimation: {
      hover: {
        scale: [1, 1.15, 0.95, 1.1, 1],
        rotate: [0, -5, 5, -5, 0],
        transition: { duration: 0.5 },
      },
    },
  },
  {
    href: '/quiz-mode',
    label: 'Practice Quiz',
    icon: Brain,
    color: 'text-amber-500',
    hoverBg: 'hover:bg-amber-50/50 dark:hover:bg-amber-950/20',
    iconAnimation: {
      hover: {
        rotate: 360,
        scale: 1.15,
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  },
]

export default function HeaderNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-2 lg:flex">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link key={item.href} href={item.href} className="relative">
            <motion.div
              whileHover="hover"
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400'
                  : 'text-gray-650 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              } ${item.hoverBg}`}
            >
              <motion.div
                variants={item.iconAnimation as any}
                className={`${item.color} shrink-0`}
              >
                <Icon className="h-4.5 w-4.5" />
              </motion.div>
              <span>{item.label}</span>

              {/* Active Underline Pill */}
              {isActive && (
                <motion.div
                  layoutId="activeHeaderNav"
                  className="absolute inset-0 -z-10 rounded-xl border border-indigo-200/50 bg-gradient-to-tr from-indigo-500/5 to-indigo-600/10 dark:border-indigo-800/30 dark:from-indigo-400/5 dark:to-indigo-500/10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </motion.div>
          </Link>
        )
      })}
    </nav>
  )
}
