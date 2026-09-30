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
          <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-full bg-[#1E3A8A] text-white text-[11px] uppercase tracking-widest font-medium shadow-xl shadow-blue-900/20 animate-in fade-in">
            {toastMessage}
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-medium text-white tracking-tight">
                  Assignments & Deadlines
                </h2>
                <span className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full bg-[#1E3A8A]/25 text-[#3B82F6] border border-[#1E3A8A]/60">
                  Deliverables
                </span>
              </div>
              <p className="text-[11px] uppercase tracking-widest font-medium text-zinc-500 mt-1">
                Track deliverables, due dates, and completion
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchAssignments}
                className="p-2 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-900/50 transition-colors duration-300"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white text-xs font-medium shadow-xl shadow-blue-900/20 active:scale-95 transition-all duration-300"
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
              className={`p-4 rounded-2xl border text-left transition-all duration-300 backdrop-blur-md group ${ activeTab === 'active' ? 'bg-[#1E3A8A]/25 border-[#1E3A8A]/60 shadow-lg shadow-blue-900/20' : 'bg-zinc-900/40 border-zinc-800/50 hover:border-[#1E3A8A]/60' }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase tracking-widest font-medium transition-colors ${activeTab === 'active' ? 'text-[#3B82F6]' : 'text-zinc-500 group-hover:text-[#3B82F6]'}`}>Active / Upcoming</span>
                <Clock className={`w-4 h-4 transition-colors ${activeTab === 'active' ? 'text-[#3B82F6]' : 'text-zinc-500 group-hover:text-[#3B82F6]'}`} />
              </div>
              <div className="text-3xl font-medium font-mono text-white mt-2">
                {summary.active}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('overdue')}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 backdrop-blur-md group ${ activeTab === 'overdue' ? 'bg-red-950/40 border-red-900/60 shadow-lg shadow-red-900/20' : 'bg-zinc-900/40 border-zinc-800/50 hover:border-red-900/60' }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase tracking-widest font-medium transition-colors ${activeTab === 'overdue' ? 'text-red-400' : 'text-zinc-500 group-hover:text-red-400'}`}>Overdue (Terlewat)</span>
                <AlertTriangle className={`w-4 h-4 transition-colors ${activeTab === 'overdue' ? 'text-red-400' : 'text-zinc-500 group-hover:text-red-400'}`} />
              </div>
              <div className="text-3xl font-medium font-mono text-white mt-2">
                {summary.overdue}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 backdrop-blur-md group ${ activeTab === 'completed' ? 'bg-emerald-950/40 border-emerald-900/60 shadow-lg shadow-emerald-900/20' : 'bg-zinc-900/40 border-zinc-800/50 hover:border-emerald-900/60' }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase tracking-widest font-medium transition-colors ${activeTab === 'completed' ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-emerald-400'}`}>Completed (Selesai)</span>
                <CheckCircle2 className={`w-4 h-4 transition-colors ${activeTab === 'completed' ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-emerald-400'}`} />
              </div>
              <div className="text-3xl font-medium font-mono text-white mt-2">
                {summary.completed}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 backdrop-blur-md group ${ activeTab === 'all' ? 'bg-zinc-800/40 border-zinc-700/60 shadow-lg shadow-zinc-900/20' : 'bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700/60' }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase tracking-widest font-medium transition-colors ${activeTab === 'all' ? 'text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-300'}`}>Total Assignments</span>
                <FolderArchive className={`w-4 h-4 transition-colors ${activeTab === 'all' ? 'text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
              </div>
              <div className="text-3xl font-medium font-mono text-white mt-2">
                {summary.total}
              </div>
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-md">
            {/* View Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-widest font-medium whitespace-nowrap transition-colors duration-300 ${ activeTab === 'active' ? 'bg-[#1E3A8A]/25 text-[#3B82F6] border border-[#1E3A8A]/60' : 'text-zinc-500 border border-transparent hover:text-white hover:bg-zinc-900/50' }`}
              >
                Active & Upcoming ({summary.active})
              </button>

              <button
                onClick={() => setActiveTab('overdue')}
                className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-widest font-medium whitespace-nowrap transition-colors duration-300 ${ activeTab === 'overdue' ? 'bg-red-950/40 text-red-400 border border-red-900/60' : 'text-zinc-500 border border-transparent hover:text-white hover:bg-zinc-900/50' }`}
              >
                Overdue ({summary.overdue})
              </button>

              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-widest font-medium whitespace-nowrap transition-colors duration-300 ${ activeTab === 'completed' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60' : 'text-zinc-500 border border-transparent hover:text-white hover:bg-zinc-900/50' }`}
              >
                History ({summary.completed})
              </button>

              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-widest font-medium whitespace-nowrap transition-colors duration-300 ${ activeTab === 'all' ? 'bg-zinc-800/40 text-zinc-300 border border-zinc-700/60' : 'text-zinc-500 border border-transparent hover:text-white hover:bg-zinc-900/50' }`}
              >
                All ({summary.total})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative sm:w-64 flex-shrink-0">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-full bg-zinc-900/40 border border-zinc-800/50 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#1E3A8A] transition-colors duration-300"
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
                    className="h-24 rounded-2xl bg-white/50 bg-zinc-900/20 border border-gray-800/60 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredList.length === 0 ? (
              <div className="text-center py-12 px-6 rounded-2xl bg-white/50 bg-zinc-900/20 border border-zinc-800/50 backdrop-blur-md">
                {activeTab === 'active' ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-[#1E3A8A]/10 border border-[#1E3A8A]/30 text-[#3B82F6] mx-auto flex items-center justify-center mb-3">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-medium text-white tracking-tight">
                      No active assignments.
                    </h3>
                    <p className="text-xs font-light text-zinc-400 mt-1">
                      You are completely caught up! No upcoming deadlines pending.
                    </p>
                  </>
                ) : activeTab === 'overdue' ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 mx-auto flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-medium text-white tracking-tight">
                      No overdue assignments!
                    </h3>
                    <p className="text-xs font-light text-zinc-400 mt-1">
                      Great discipline! None of your tasks have missed their deadlines.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 text-zinc-500 mx-auto flex items-center justify-center mb-3">
                      <FolderArchive className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-medium text-white tracking-tight">
                      No completed history yet.
                    </h3>
                    <p className="text-xs font-light text-zinc-400 mt-1">
                      Check off assignments when you finish them to see them archived here.
                    </p>
                  </>
                )}

                <div className="mt-5">
                  <button
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white text-xs font-medium transition-all duration-300 shadow-md shadow-blue-900/20 active:scale-95"
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
