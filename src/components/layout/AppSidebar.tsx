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
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
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
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col bg-gray-950/95 border-r border-gray-800/80 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-800/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              Day2Day
            </h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">
              College Management
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.comingSoon) {
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed select-none opacity-60 hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-mono">
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
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  item.active
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-gray-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      item.active ? 'text-indigo-400' : 'text-gray-400'
                    }`}
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
        <div className="p-3 border-t border-gray-800/60 space-y-2">
          <Link
            href="/api/docs"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-indigo-400 rounded-lg hover:bg-gray-900/50 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>OpenAPI Spec & Docs</span>
          </Link>

          <div className="px-3 py-2 rounded-xl bg-gray-900/50 border border-gray-800/60 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Timezone:</span>
            <span className="font-mono text-cyan-400 font-medium">Asia/Makassar</span>
          </div>
        </div>
      </aside>
    </>
  );
}
