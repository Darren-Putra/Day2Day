'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { ScheduleDatePicker } from '@/components/schedule/ScheduleDatePicker';
import { ScheduleSummary } from '@/components/schedule/ScheduleSummary';
import { SchedulePieChart } from '@/components/schedule/SchedulePieChart';
import { ScheduleList } from '@/components/schedule/ScheduleList';
import { ScheduleFormModal } from '@/components/schedule/ScheduleFormModal';
import { FreeTimeModal } from '@/components/schedule/FreeTimeModal';
import {
  ScheduleOccurrence,
  ScheduleItem,
  DailySummary,
  FreeTimeSlot,
} from '@/types/schedule';
import { getTodayInTimezone } from '@/lib/schedule/date-utils';
import { Plus, Sparkles, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SchedulePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => getTodayInTimezone());

  // User Profile
  const [userName, setUserName] = useState('Darren');
  const [userEmail, setUserEmail] = useState('darren@student.ac.id');
  const [userAvatar, setUserAvatar] = useState<string | undefined>();

  // State
  const [activities, setActivities] = useState<ScheduleOccurrence[]>([]);
  const [allRawSchedules, setAllRawSchedules] = useState<ScheduleItem[]>([]);
  const [summary, setSummary] = useState<DailySummary>({
    date: selectedDate,
    total_minutes: 1440,
    scheduled_minutes: 0,
    free_minutes: 1440,
    scheduled_percentage: 0,
    free_percentage: 100,
    activity_count: 0,
  });
  const [freeTimeSlots, setFreeTimeSlots] = useState<FreeTimeSlot[]>([]);

  // Modals & UI States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isFreeTimeModalOpen, setIsFreeTimeModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ScheduleOccurrence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load User profile
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

  // Fetch schedules, summary, and free-time for selectedDate
  const fetchScheduleData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [schedRes, sumRes, freeRes] = await Promise.all([
        fetch(`/api/schedules?date=${selectedDate}`),
        fetch(`/api/schedules/summary?date=${selectedDate}`),
        fetch(`/api/schedules/free-time?date=${selectedDate}`),
      ]);

      if (schedRes.ok) {
        const data = await schedRes.json();
        setActivities(data.activities || []);
      }

      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }

      if (freeRes.ok) {
        const freeData = await freeRes.json();
        setFreeTimeSlots(freeData.free_time || []);
      }
    } catch (err) {
      console.error('Failed to load schedule data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  const handleOpenCreateModal = () => {
    setEditingActivity(null);
    setIsFormModalOpen(true);
  };

  const handleEditActivity = (activity: ScheduleOccurrence) => {
    setEditingActivity(activity);
    setIsFormModalOpen(true);
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      const res = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('Activity deleted successfully.');
        fetchScheduleData();
      } else {
        showToast('Failed to delete activity.');
      }
    } catch {
      showToast('Error deleting activity.');
    }
  };

  const handleSlotSelect = (slot: FreeTimeSlot) => {
    // Pre-populate creation form with the free time window
    setEditingActivity({
      id: '',
      title: '',
      category: 'IMPORTANT_NOT_URGENT',
      start: slot.start,
      end: slot.end === '24:00' ? '23:59' : slot.end,
      duration_minutes: slot.duration_minutes,
      date: selectedDate,
      repeat_type: 'none',
    });
    setIsFormModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
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

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-full bg-[#1E3A8A] text-white text-[11px] uppercase tracking-widest font-medium shadow-xl shadow-blue-900/20 animate-in fade-in slide-in-from-top-2">
            {toastMessage}
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-medium tracking-tight text-white">
                Schedule Management
              </h2>
              <p className="text-[11px] uppercase tracking-widest font-medium text-zinc-500 mt-1">
                Manage classes and 24-hour daily balance
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsFreeTimeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1E3A8A]/25 hover:bg-zinc-900/50 border border-[#1E3A8A]/60 text-[#3B82F6] text-xs font-medium transition-all duration-300"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>View Free Time Slots</span>
              </button>

              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white text-xs font-medium shadow-xl shadow-blue-900/20 active:scale-95 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>Add Activity</span>
              </button>
            </div>
          </div>

          {/* 1. Date Navigator */}
          <ScheduleDatePicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          {/* 2. Daily Summary Metric Cards */}
          <ScheduleSummary
            summary={summary}
            onOpenFreeTimeModal={() => setIsFreeTimeModalOpen(true)}
          />

          {/* 3. 24-Hour Donut Chart & Breakdown */}
          <section>
            <SchedulePieChart occurrences={activities} />
          </section>

          {/* 4. Activities Timeline List */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium tracking-tight text-white">
                Daily Timeline ({activities.length} activities)
              </h3>
              <button
                onClick={fetchScheduleData}
                className="p-1.5 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-900/50 transition-colors duration-300"
                title="Refresh schedule"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <ScheduleList
              activities={activities}
              isLoading={isLoading}
              onAddClick={handleOpenCreateModal}
              onEditActivity={handleEditActivity}
              onDeleteActivity={handleDeleteActivity}
            />
          </section>
        </main>
      </div>

      {/* Modal for Creating or Editing */}
      <ScheduleFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingActivity(null);
        }}
        onSuccess={() => {
          showToast(
            editingActivity
              ? 'Activity updated successfully!'
              : 'Activity created successfully!'
          );
          fetchScheduleData();
        }}
        defaultDate={selectedDate}
        existingSchedules={allRawSchedules}
        editingActivity={editingActivity}
      />

      {/* Free Time Slots Modal */}
      <FreeTimeModal
        isOpen={isFreeTimeModalOpen}
        onClose={() => setIsFreeTimeModalOpen(false)}
        slots={freeTimeSlots}
        date={selectedDate}
        onSelectSlot={handleSlotSelect}
      />
    </div>
  );
}
