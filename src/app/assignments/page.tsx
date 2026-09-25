'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { AssignmentCard } from '@/components/assignment/AssignmentCard';
import { AssignmentFormModal } from '@/components/assignment/AssignmentFormModal';
import {
  AssignmentItem,
  AssignmentFilterView,
  AssignmentSummaryCounts,
} from '@/types/assignment';
import { createClient } from '@/lib/supabase/client';
import {
  Plus,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderArchive,
  Sparkles,
  RefreshCw,
  Search,
} from 'lucide-react';

export default function AssignmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('Darren');
  const [userEmail, setUserEmail] = useState('darren@student.ac.id');
  const [userAvatar, setUserAvatar] = useState<string | undefined>();

  // State
  const [activeTab, setActiveTab] = useState<AssignmentFilterView>('active');
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [summary, setSummary] = useState<AssignmentSummaryCounts>({
    total: 0,
    active: 0,
    overdue: 0,
    completed: 0,
  });
  const [courseFilter, setCourseFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Feedback
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentItem | null>(null);
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

  // Fetch Assignments
  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = new URL('/api/assignments', window.location.origin);
      url.searchParams.set('view', activeTab);
      if (courseFilter) url.searchParams.set('course', courseFilter);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, courseFilter]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleToggleStatus = async (
    id: string,
    newStatus: 'PENDING' | 'COMPLETED'
  ) => {
    try {
      const res = await fetch(`/api/assignments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        showToast(
          newStatus === 'COMPLETED'
            ? 'Assignment marked as completed!'
            : 'Assignment marked as pending.'
        );
        fetchAssignments();
      }
    } catch {
      showToast('Error updating assignment.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Assignment deleted.');
        fetchAssignments();
      }
    } catch {
      showToast('Failed to delete assignment.');
    }
  };

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AssignmentItem) => {
    setEditingAssignment(item);
    setIsModalOpen(true);
  };

  // Search query filter
  const filteredList = assignments.filter((a) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(query) ||
      a.course_name?.toLowerCase().includes(query) ||
      a.notes?.toLowerCase().includes(query)
    );
  });

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

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-xl shadow-indigo-600/30 animate-in fade-in">
            {toastMessage}
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  Assignments & Deadlines
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  Deliverables
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Track deliverables, due dates, estimated work hours, and completion history
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchAssignments}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-900 border border-gray-800 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Assignment</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <button
              onClick={() => setActiveTab('active')}
              className={`p-4 rounded-2xl border text-left transition-all backdrop-blur-md ${
                activeTab === 'active'
                  ? 'bg-cyan-500/15 border-cyan-500/50 shadow-lg shadow-cyan-950/20'
                  : 'bg-gray-900/50 border-gray-800/80 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Active / Upcoming</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">
                {summary.active}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">Tenggat berlaku</div>
            </button>

            <button
              onClick={() => setActiveTab('overdue')}
              className={`p-4 rounded-2xl border text-left transition-all backdrop-blur-md ${
                activeTab === 'overdue'
                  ? 'bg-red-500/15 border-red-500/50 shadow-lg shadow-red-950/20'
                  : 'bg-gray-900/50 border-gray-800/80 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Overdue (Terlewat)</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-red-400 mt-2">
                {summary.overdue}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">Tenggat lewat</div>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`p-4 rounded-2xl border text-left transition-all backdrop-blur-md ${
                activeTab === 'completed'
                  ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                  : 'bg-gray-900/50 border-gray-800/80 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Completed (Selesai)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                {summary.completed}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">Riwayat tuntas</div>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`p-4 rounded-2xl border text-left transition-all backdrop-blur-md ${
                activeTab === 'all'
                  ? 'bg-indigo-500/15 border-indigo-500/50 shadow-lg shadow-indigo-950/20'
                  : 'bg-gray-900/50 border-gray-800/80 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Total Assignments</span>
                <FolderArchive className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-indigo-300 mt-2">
                {summary.total}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">Semua catatan tugas</div>
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-900/60 border border-gray-800/80 rounded-2xl backdrop-blur-md">
            {/* View Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'active'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                Active & Upcoming ({summary.active})
              </button>

              <button
                onClick={() => setActiveTab('overdue')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'overdue'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                Overdue ({summary.overdue})
              </button>

              <button
                onClick={() => setActiveTab('completed')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                History ({summary.completed})
              </button>

              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'all'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                All ({summary.total})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative sm:w-64 flex-shrink-0">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* List Section */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-24 rounded-2xl bg-gray-900/40 border border-gray-800/60 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredList.length === 0 ? (
              <div className="text-center py-12 px-6 rounded-2xl bg-gray-900/40 border border-gray-800/80 backdrop-blur-md">
                {activeTab === 'active' ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center mb-3">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-200">
                      No active assignments.
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      You are completely caught up! No upcoming deadlines pending.
                    </p>
                  </>
                ) : activeTab === 'overdue' ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-200">
                      No overdue assignments!
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Great discipline! None of your tasks have missed their deadlines.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-gray-800 border border-gray-700 text-gray-400 mx-auto flex items-center justify-center mb-3">
                      <FolderArchive className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-200">
                      No completed history yet.
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Check off assignments when you finish them to see them archived here.
                    </p>
                  </>
                )}

                <div className="mt-5">
                  <button
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all active:scale-95 shadow-md shadow-indigo-600/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Assignment</span>
                  </button>
                </div>
              </div>
            ) : (
              filteredList.map((item) => (
                <AssignmentCard
                  key={item.id}
                  assignment={item}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      <AssignmentFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAssignment(null);
        }}
        onSuccess={() => {
          showToast(
            editingAssignment
              ? 'Assignment updated successfully.'
              : 'Assignment created successfully.'
          );
          fetchAssignments();
        }}
        editingAssignment={editingAssignment}
      />
    </div>
  );
}
