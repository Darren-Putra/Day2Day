'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarClock,
  CheckSquare,
  BookOpen,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
  Code2,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      name: 'Schedule',
      href: '/schedule',
      icon: CalendarClock,
      active: pathname.startsWith('/schedule'),
      badge: 'Core MVP',
      badgeColor: 'bg-[#1E3A8A]/20 dark:bg-[#1E3A8A]/40 text-[#3B82F6] dark:text-[#3B82F6] border border-indigo-500/30',
    },
    {
      name: 'Tasks',
      href: '#',
      icon: CheckSquare,
      comingSoon: true,
    },
    {
      name: 'Assignments',
      href: '/assignments',
      icon: BookOpen,
      active: pathname.startsWith('/assignments'),
      badge: 'New',
      badgeColor: 'bg-cyan-500/20 text-[#3B82F6] dark:text-[#3B82F6] border border-cyan-500/30',
    },
    {
      name: 'Notes',
      href: '#',
      icon: FileText,
      comingSoon: true,
    },
    {
      name: 'Calendar',
      href: '#',
      icon: Calendar,
      comingSoon: true,
    },
    {
      name: 'Analytics',
      href: '#',
      icon: BarChart3,
      comingSoon: true,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      active: pathname.startsWith('/settings'),
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-white/70 dark:bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col bg-white/80 dark:bg-black/20 border-r border-zinc-200 dark:border-zinc-800/50 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${ isOpen ? 'translate-x-0' : '-translate-x-full' }`}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-zinc-200 dark:border-zinc-800/50">
          <div className="w-9 h-9 rounded-full bg-[#1E3A8A] flex items-center justify-center shadow-md shadow-blue-900/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">
              Day2Day
            </h1>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium tracking-wide uppercase">
              College Management
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.comingSoon) {
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between px-3 py-2.5 rounded-3xl text-sm font-medium text-zinc-400 dark:text-zinc-600 cursor-not-allowed select-none opacity-60 hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 font-mono">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-3xl text-sm font-medium transition-all duration-150 ${ item.active ? 'bg-[#1E3A8A]/10 dark:bg-[#1E3A8A]/25 text-[#3B82F6] dark:text-[#3B82F6] border border-[#1E3A8A]/30 dark:border-[#1E3A8A]/60 shadow-sm' : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-white/70 hover:dark:bg-zinc-900/30' }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${ item.active ? 'text-[#3B82F6] dark:text-[#3B82F6]' : 'text-zinc-500 dark:text-zinc-500' }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom footer links */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/50 space-y-2">
          <Link
            href="/api/docs"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-500 hover:text-[#3B82F6] hover:dark:text-[#3B82F6] rounded-2xl hover:bg-zinc-100/80 hover:dark:bg-zinc-900/30 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-[#3B82F6] dark:text-[#3B82F6]" />
            <span>OpenAPI Spec & Docs</span>
          </Link>

          <div className="px-3 py-2 rounded-3xl bg-zinc-100/80 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 text-[11px] text-zinc-500 dark:text-zinc-500 flex items-center justify-between">
            <span>Timezone:</span>
            <span className="font-mono text-[#3B82F6] dark:text-[#3B82F6] font-medium">Asia/Makassar</span>
          </div>
        </div>
      </aside>
    </>
  );
}
