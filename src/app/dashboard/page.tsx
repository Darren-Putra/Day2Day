'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppNavbar } from '@/components/layout/AppNavbar';
import {
  CalendarClock,
  CheckSquare,
  BookOpen,
  FileText,
  Calendar,
  BarChart3,
  ArrowRight,
  Clock,
  Sparkles,
  Plus,
  Compass,
} from 'lucide-react';
import { ScheduleOccurrence, DailySummary } from '@/types/schedule';
import { formatDuration, getTodayInTimezone } from '@/lib/schedule/date-utils';
import { ScheduleCard } from '@/components/schedule/ScheduleCard';
import { ScheduleFormModal } from '@/components/schedule/ScheduleFormModal';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('Darren');
  const [userEmail, setUserEmail] = useState('darren@student.ac.id');
  const [userAvatar, setUserAvatar] = useState<string | undefined>();
  const [greeting, setGreeting] = useState('Good day');

  const [todayDate] = useState(() => getTodayInTimezone());
  const [todayActivities, setTodayActivities] = useState<ScheduleOccurrence[]>([]);
  const [summary, setSummary] = useState<DailySummary>({
    date: todayDate,
    total_minutes: 1440,
    scheduled_minutes: 0,
    free_minutes: 1440,
    scheduled_percentage: 0,
    free_percentage: 100,
    activity_count: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Compute dynamic greeting based on hour in Asia/Makassar
  useEffect(() => {
    const hour = parseInt(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Makassar',
        hour: 'numeric',
        hour12: false,
      }).format(new Date()),
      10
    );

    if (hour >= 5 && hour < 12) setGreeting('Good morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
    else if (hour >= 17 && hour < 21) setGreeting('Good evening');
    else setGreeting('Good night');
  }, []);

  // Fetch user profile from Supabase
  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'Darren';
          setUserName(name);
          setUserEmail(user.email || 'user@example.com');
          setUserAvatar(user.user_metadata?.avatar_url || user.user_metadata?.picture);
        }
      } catch {
        // Dev fallback
      }
    }
    loadUser();
  }, []);

  // Load today's schedules & summary
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [schedRes, summaryRes] = await Promise.all([
        fetch(`/api/schedules/today`),
        fetch(`/api/schedules/summary?date=${todayDate}`),
      ]);

      if (schedRes.ok) {
        const schedData = await schedRes.json();
        setTodayActivities(schedData.activities || []);
      }
      if (summaryRes.ok) {
        const sumData = await summaryRes.json();
        setSummary(sumData);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [todayDate]);

  const featureCards = [
    {
      title: 'Schedule',
      description: '24-hour time management, conflict detection & recurrence',
      icon: CalendarClock,
      href: '/schedule',
      status: 'Active',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      iconGradient: 'from-indigo-600 to-cyan-500',
    },
    {
      title: 'Tasks',
      description: 'Prioritize daily college to-dos with Eisenhower matrix',
      icon: CheckSquare,
      href: '#',
      status: 'Coming Soon',
      statusColor: 'bg-gray-800 text-gray-400 border border-gray-700',
      iconGradient: 'from-gray-700 to-gray-800',
      comingSoon: true,
    },
    {
      title: 'Assignments',
      description: 'Course deliverables, deadline countdowns & work hour estimates',
      icon: BookOpen,
      href: '/assignments',
      status: 'Active',
      statusColor: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
      iconGradient: 'from-cyan-600 to-blue-500',
    },
    {
      title: 'Notes',
      description: 'Lecture notes, revision summaries, and markdown support',
      icon: FileText,
      href: '#',
      status: 'Coming Soon',
      statusColor: 'bg-gray-800 text-gray-400 border border-gray-700',
      iconGradient: 'from-gray-700 to-gray-800',
      comingSoon: true,
    },
    {
      title: 'Calendar',
      description: 'Semester calendar, exam periods, and university milestones',
      icon: Calendar,
      href: '#',
      status: 'Coming Soon',
      statusColor: 'bg-gray-800 text-gray-400 border border-gray-700',
      iconGradient: 'from-gray-700 to-gray-800',
      comingSoon: true,
    },
    {
      title: 'Analytics',
      description: 'Time audit, study habits, and productivity metrics',
      icon: BarChart3,
      href: '#',
      status: 'Coming Soon',
      statusColor: 'bg-gray-800 text-gray-400 border border-gray-700',
      iconGradient: 'from-gray-700 to-gray-800',
      comingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col flex-1">
        <AppNavbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Greeting Hero */}
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950/60 via-gray-900 to-cyan-950/40 border border-gray-800/80 shadow-2xl backdrop-blur-xl">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>College Management Workspace</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                  {greeting}, {userName}
                </h2>
                <p className="text-sm text-gray-400 mt-1 max-w-xl">
                  Here is your college overview for today in{' '}
                  <span className="text-cyan-400 font-mono font-medium">
                    Asia/Makassar
                  </span>
                  .
                </p>
              </div>

              {/* Schedule CTA */}
              <div className="flex-shrink-0 flex items-center gap-3">
                <Link
                  href="/schedule"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <CalendarClock className="w-4 h-4" />
                  <span>Open Schedule</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Today's Schedule Snapshot */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-100 tracking-tight">
                  Today&apos;s Schedule
                </h3>
                <p className="text-xs text-gray-400">
                  {todayDate} • Daily overview & free time balance
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-medium text-gray-300 hover:text-white hover:border-indigo-500/40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Add Activity</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md">
                <span className="text-xs text-gray-400 font-medium">Activities Planned</span>
                <div className="mt-2 text-2xl font-bold font-mono text-white">
                  {summary.activity_count} Activities
                </div>
                <div className="text-[11px] text-gray-400 mt-1">Today in calendar</div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md">
                <span className="text-xs text-indigo-300 font-medium">Scheduled Time</span>
                <div className="mt-2 text-2xl font-bold font-mono text-indigo-400">
                  {formatDuration(summary.scheduled_minutes)} Scheduled
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  {summary.scheduled_percentage}% of your day
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md">
                <span className="text-xs text-cyan-300 font-medium">Free Time</span>
                <div className="mt-2 text-2xl font-bold font-mono text-cyan-400">
                  {formatDuration(summary.free_minutes)} Free
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  {summary.free_percentage}% available for rest/study
                </div>
              </div>
            </div>

            {/* Activities preview list */}
            <div className="space-y-2 mt-4">
              {todayActivities.length === 0 ? (
                <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800 text-center">
                  <p className="text-xs text-gray-400">
                    No activities scheduled for today. Your entire day is free!
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Plan your first activity</span>
                  </button>
                </div>
              ) : (
                todayActivities.slice(0, 3).map((act) => (
                  <ScheduleCard
                    key={act.id}
                    activity={act}
                  />
                ))
              )}

              {todayActivities.length > 3 && (
                <div className="text-center pt-2">
                  <Link
                    href="/schedule"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    View all {todayActivities.length} activities on Schedule page →
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Feature Modules Grid */}
          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-100 tracking-tight">
                System Modules
              </h3>
              <p className="text-xs text-gray-400">
                Modular architecture ready for all college management features
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featureCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className={`relative p-5 rounded-2xl border transition-all duration-200 backdrop-blur-md ${
                      card.comingSoon
                        ? 'bg-gray-900/40 border-gray-800/60 opacity-70'
                        : 'bg-gray-900/70 border-indigo-500/30 hover:border-indigo-500/60 shadow-lg shadow-indigo-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.iconGradient} flex items-center justify-center text-white shadow-md`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${card.statusColor}`}>
                        {card.status}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-gray-100">
                      {card.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {card.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-800/80">
                      {card.comingSoon ? (
                        <span className="text-xs text-gray-400 font-medium">
                          Roadmap release
                        </span>
                      ) : (
                        <Link
                          href={card.href}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                        >
                          <span>Manage {card.title}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {/* Schedule Form Modal for creating from dashboard */}
      <ScheduleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadDashboardData}
        defaultDate={todayDate}
        existingSchedules={[]}
      />
    </div>
  );
}
