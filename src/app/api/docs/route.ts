import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');
  const acceptHeader = request.headers.get('accept') || '';

  const wantsJson =
    format === 'json' ||
    (acceptHeader.includes('application/json') && !acceptHeader.includes('text/html'));

  const openApiDoc = {
    openapi: '3.1.0',
    info: {
      title: 'Day2Day Personal College Management API',
      version: '1.2.0',
      description:
        'Machine-readable REST API for managing college schedules, assignments/deadlines, conflict detection, 24h free time calculation, and integration with AI agents or automation scripts.',
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        description: 'Current environment server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API_KEY',
          description:
            'Pass your generated API Key in the Authorization header: Bearer d2d_live_...',
        },
      },
      schemas: {
        Activity: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Kuliah Algoritma' },
            category: {
              type: 'string',
              enum: [
                'IMPORTANT_URGENT',
                'IMPORTANT_NOT_URGENT',
                'NOT_IMPORTANT_URGENT',
                'NOT_IMPORTANT_NOT_URGENT',
              ],
            },
            start: { type: 'string', example: '08:00' },
            end: { type: 'string', example: '10:00' },
            duration_minutes: { type: 'integer', example: 120 },
            repeat_type: { type: 'string', example: 'weekly' },
          },
        },
        Assignment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Makalah Etika Profesi' },
            course_name: { type: 'string', example: 'Etika Komputer', nullable: true },
            due_date: { type: 'string', example: '2026-09-28' },
            due_time: { type: 'string', example: '23:59' },
            estimated_duration_minutes: { type: 'integer', example: 120 },
            category: {
              type: 'string',
              enum: [
                'IMPORTANT_URGENT',
                'IMPORTANT_NOT_URGENT',
                'NOT_IMPORTANT_URGENT',
                'NOT_IMPORTANT_NOT_URGENT',
              ],
            },
            status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'] },
            notes: { type: 'string', nullable: true },
            is_overdue: { type: 'boolean', example: false },
            days_remaining: { type: 'integer', example: 2 },
          },
        },
        FreeTimeSlot: {
          type: 'object',
          properties: {
            start: { type: 'string', example: '10:00' },
            end: { type: 'string', example: '12:00' },
            duration_minutes: { type: 'integer', example: 120 },
          },
        },
        DailySummary: {
          type: 'object',
          properties: {
            date: { type: 'string', example: '2026-09-26' },
            total_minutes: { type: 'integer', example: 1440 },
            scheduled_minutes: { type: 'integer', example: 300 },
            free_minutes: { type: 'integer', example: 1140 },
            scheduled_percentage: { type: 'number', example: 20.83 },
            free_percentage: { type: 'number', example: 79.17 },
            activity_count: { type: 'integer', example: 3 },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    paths: {
      '/api/schedules': {
        get: {
          summary: 'Get schedules for a single date or date range',
          parameters: [
            {
              name: 'date',
              in: 'query',
              required: false,
              schema: { type: 'string', example: '2026-09-26' },
              description: 'Date in YYYY-MM-DD format (defaults to today in Asia/Makassar)',
            },
            {
              name: 'from',
              in: 'query',
              required: false,
              schema: { type: 'string', example: '2026-09-26' },
            },
            {
              name: 'to',
              in: 'query',
              required: false,
              schema: { type: 'string', example: '2026-10-02' },
            },
          ],
          responses: {
            '200': { description: 'List of activities for date or range' },
            '401': { description: 'Unauthorized' },
          },
        },
        post: {
          summary: 'Create a new schedule with conflict detection',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'category', 'date', 'start', 'end'],
                  properties: {
                    title: { type: 'string' },
                    category: {
                      type: 'string',
                      enum: [
                        'IMPORTANT_URGENT',
                        'IMPORTANT_NOT_URGENT',
                        'NOT_IMPORTANT_URGENT',
                        'NOT_IMPORTANT_NOT_URGENT',
                      ],
                    },
                    date: { type: 'string', example: '2026-09-26' },
                    start: { type: 'string', example: '14:00' },
                    end: { type: 'string', example: '16:00' },
                    repeat: {
                      type: 'object',
                      properties: {
                        type: {
                          type: 'string',
                          enum: ['none', 'daily', 'weekly', 'monthly', 'yearly', 'custom'],
                        },
                        interval: { type: 'integer', default: 1 },
                        days: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                        until: { type: 'string', nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Activity created' },
            '409': { description: 'Schedule conflict detected' },
            '422': { description: 'Validation error' },
          },
        },
      },
      '/api/schedules/today': {
        get: {
          summary: "Get today's schedules in Asia/Makassar timezone",
          responses: {
            '200': { description: "Today's activities" },
          },
        },
      },
      '/api/schedules/free-time': {
        get: {
          summary: 'Calculate available free time slots in the 24-hour day',
          parameters: [
            {
              name: 'date',
              in: 'query',
              schema: { type: 'string', example: '2026-09-26' },
            },
          ],
          responses: {
            '200': { description: 'Free time slots' },
          },
        },
      },
      '/api/schedules/summary': {
        get: {
          summary: 'Get 24h summary statistics and percentage utilization',
          parameters: [
            {
              name: 'date',
              in: 'query',
              schema: { type: 'string', example: '2026-09-26' },
            },
          ],
          responses: {
            '200': { description: 'Daily summary statistics' },
          },
        },
      },
      '/api/schedules/{id}': {
        patch: {
          summary: 'Update schedule by ID with conflict detection',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Updated' },
            '404': { description: 'Not found' },
            '409': { description: 'Conflict' },
          },
        },
        delete: {
          summary: 'Delete schedule by ID',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Deleted' },
            '404': { description: 'Not found' },
          },
        },
      },
      '/api/assignments': {
        get: {
          summary: 'Get filtered assignments (active, overdue, completed, or all)',
          parameters: [
            {
              name: 'view',
              in: 'query',
              required: false,
              schema: {
                type: 'string',
                enum: ['active', 'overdue', 'completed', 'all'],
                default: 'active',
              },
            },
            {
              name: 'course',
              in: 'query',
              required: false,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'List of assignments' },
          },
        },
        post: {
          summary: 'Create a new assignment / deliverable with work estimate',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'due_date', 'category'],
                  properties: {
                    title: { type: 'string' },
                    course_name: { type: 'string' },
                    due_date: { type: 'string' },
                    due_time: { type: 'string' },
                    estimated_duration_minutes: { type: 'integer' },
                    category: { type: 'string' },
                    notes: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Created' },
          },
        },
      },
      '/api/assignments/{id}': {
        patch: {
          summary: 'Update assignment (e.g. toggle status to COMPLETED)',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Updated' },
          },
        },
        delete: {
          summary: 'Delete assignment',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Deleted' },
          },
        },
      },
      '/api/keys': {
        get: {
          summary: 'List user API keys',
          responses: {
            '200': { description: 'List of keys' },
          },
        },
        post: {
          summary: 'Generate a new API key',
          responses: {
            '201': { description: 'API Key generated' },
          },
        },
      },
    },
  };

  if (wantsJson) {
    return NextResponse.json(openApiDoc);
  }

  // Interactive HTML Documentation with Templates & AI System Prompt
  const html = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Day2Day API Documentation & AI Templates</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0b0f19; color: #f3f4f6; font-family: system-ui, -apple-system, sans-serif; }
    pre { background-color: #030712; border: 1px solid #1f2937; border-radius: 0.75rem; padding: 1rem; overflow-x: auto; }
  </style>
</head>
<body class="p-6 md:p-12 max-w-5xl mx-auto space-y-10">
  <!-- Header -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
    <div>
      <div class="flex items-center gap-2">
        <h1 class="text-3xl font-extrabold tracking-tight text-white">Day2Day API Documentation</h1>
        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">v1.2.0</span>
      </div>
      <p class="text-sm text-gray-400 mt-1">Machine-readable REST API for Schedules, Assignments, 24h Free-Time & AI Automations</p>
    </div>
    <div class="flex items-center gap-3">
      <a href="/llms.txt" target="_blank" class="px-3.5 py-2 text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-xl hover:bg-cyan-500/30 transition-colors">
        📄 View llms.txt
      </a>
      <a href="/api/docs?format=json" target="_blank" class="px-3.5 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors">
        { } OpenAPI JSON
      </a>
    </div>
  </div>

  <!-- Meta Badges -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
    <div class="p-3 rounded-xl bg-gray-900 border border-gray-800"><span class="text-gray-500 block">BASE URL</span><span class="text-indigo-400 font-bold">http://localhost:3000</span></div>
    <div class="p-3 rounded-xl bg-gray-900 border border-gray-800"><span class="text-gray-500 block">TIMEZONE</span><span class="text-cyan-400 font-bold">Asia/Makassar (UTC+8)</span></div>
    <div class="p-3 rounded-xl bg-gray-900 border border-gray-800"><span class="text-gray-500 block">AUTHENTICATION</span><span class="text-emerald-400 font-bold">Bearer &lt;API_KEY&gt;</span></div>
    <div class="p-3 rounded-xl bg-gray-900 border border-gray-800"><span class="text-gray-500 block">AI COMPATIBILITY</span><span class="text-amber-400 font-bold">OpenAPI 3.1 & llms.txt</span></div>
  </div>

  <!-- AI System Prompt Section -->
  <section class="space-y-3 p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-bold text-white flex items-center gap-2">
        <span>🤖 AI Agent System Prompt (Ready to Copy)</span>
      </h2>
      <span class="text-xs text-cyan-400 font-mono">Paste into ChatGPT / Claude / LangChain</span>
    </div>
    <pre class="text-xs text-gray-300 leading-relaxed"><code>You are Day2Day College Assistant, an intelligent personal assistant managing Darren's college life.
Your goal is to help schedule classes, study sessions, and manage assignment deadlines.

Key Rules:
1. Always respect the timezone: Asia/Makassar (UTC+8).
2. Before scheduling any activity, check for available free time slots using GET /api/schedules/free-time.
3. If an activity overlaps with an existing schedule, the API will return HTTP 409 Conflict. Propose another free slot.
4. Categorize activities using the Eisenhower Matrix:
   - IMPORTANT_URGENT (Q1: Do First - urgent deadlines, exams)
   - IMPORTANT_NOT_URGENT (Q2: Plan - deep study, assignments due later, exercise)
   - NOT_IMPORTANT_URGENT (Q3: Delegate / Quick tasks)
   - NOT_IMPORTANT_NOT_URGENT (Q4: Eliminate / Leisure)</code></pre>
  </section>

  <!-- Strict Enum Options Reference -->
  <section class="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-4">
    <h2 class="text-base font-bold text-white flex items-center gap-2">
      <span>🔒 Strict Allowed Enum Values (Tidak Boleh Diisi Sembarangan)</span>
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
      <div class="p-3 rounded-xl bg-gray-950 border border-gray-800">
        <span class="text-indigo-400 font-bold block mb-1">category (4 Opsi Saja)</span>
        <ul class="text-gray-300 font-mono text-[11px] space-y-1">
          <li>• IMPORTANT_URGENT</li>
          <li>• IMPORTANT_NOT_URGENT</li>
          <li>• NOT_IMPORTANT_URGENT</li>
          <li>• NOT_IMPORTANT_NOT_URGENT</li>
        </ul>
      </div>
      <div class="p-3 rounded-xl bg-gray-950 border border-gray-800">
        <span class="text-cyan-400 font-bold block mb-1">repeat.type (Schedules)</span>
        <ul class="text-gray-300 font-mono text-[11px] space-y-1">
          <li>• none (satu kali)</li>
          <li>• daily (harian)</li>
          <li>• weekly (mingguan)</li>
          <li>• monthly (bulanan)</li>
          <li>• yearly (tahunan)</li>
          <li>• custom</li>
        </ul>
      </div>
      <div class="p-3 rounded-xl bg-gray-950 border border-gray-800">
        <span class="text-emerald-400 font-bold block mb-1">status & view (Assignments)</span>
        <ul class="text-gray-300 font-mono text-[11px] space-y-1">
          <li>• status: PENDING | IN_PROGRESS | COMPLETED</li>
          <li>• view: active | overdue | completed | all</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Ready-to-Use Templates -->
  <section class="space-y-6">
    <h2 class="text-xl font-bold text-white tracking-tight">📦 Ready-to-Use Payload Templates</h2>

    <!-- Schedule Templates -->
    <div class="space-y-3">
      <h3 class="text-sm font-semibold text-indigo-400 uppercase tracking-wider">1. Schedule Activity Templates (POST /api/schedules)</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div class="text-xs text-gray-400 mb-1.5 font-medium">One-Off Event / Study Session</div>
          <pre class="text-xs text-indigo-200"><code>{
  "title": "Belajar Mandiri Next.js",
  "category": "IMPORTANT_NOT_URGENT",
  "date": "2026-09-28",
  "start": "14:00",
  "end": "16:00",
  "repeat": { "type": "none" }
}</code></pre>
        </div>
        <div>
          <div class="text-xs text-gray-400 mb-1.5 font-medium">Recurring Weekly Lecture</div>
          <pre class="text-xs text-indigo-200"><code>{
  "title": "Kuliah Struktur Data",
  "category": "IMPORTANT_URGENT",
  "date": "2026-09-28",
  "start": "08:00",
  "end": "10:30",
  "repeat": {
    "type": "weekly",
    "interval": 1,
    "days": ["MONDAY"],
    "until": "2026-12-31"
  }
}</code></pre>
        </div>
      </div>
    </div>

    <!-- Assignment Templates -->
    <div class="space-y-3">
      <h3 class="text-sm font-semibold text-cyan-400 uppercase tracking-wider">2. Assignment / Deadline Templates (POST /api/assignments)</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div class="text-xs text-gray-400 mb-1.5 font-medium">Homework / Paper (Tugas Kuliah)</div>
          <pre class="text-xs text-cyan-200"><code>{
  "title": "Makalah Etika Profesi Komputer",
  "course_name": "Etika Profesi",
  "due_date": "2026-10-02",
  "due_time": "23:59",
  "estimated_duration_minutes": 120,
  "category": "IMPORTANT_NOT_URGENT",
  "notes": "Format APA 7th, minimal 5 halaman"
}</code></pre>
        </div>
        <div>
          <div class="text-xs text-gray-400 mb-1.5 font-medium">Major Final Project</div>
          <pre class="text-xs text-cyan-200"><code>{
  "title": "Tugas Besar: Implementasi Supabase",
  "course_name": "Rekayasa Web",
  "due_date": "2026-10-15",
  "due_time": "23:59",
  "estimated_duration_minutes": 360,
  "category": "IMPORTANT_URGENT",
  "notes": "Lengkap dengan unit tests"
}</code></pre>
        </div>
      </div>
    </div>

    <!-- AI Auto-Scheduling Workflow -->
    <div class="space-y-3">
      <h3 class="text-sm font-semibold text-emerald-400 uppercase tracking-wider">3. AI Auto-Scheduling 4-Step Workflow</h3>
      <div class="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-3 text-xs">
        <div class="flex items-start gap-2">
          <span class="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold flex-shrink-0">1</span>
          <div><strong>Ambil tugas aktif:</strong> <code>GET /api/assignments?view=active</code> &rarr; Mengetahui tenggat dan <code>estimated_duration_minutes</code>.</div>
        </div>
        <div class="flex items-start gap-2">
          <span class="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold flex-shrink-0">2</span>
          <div><strong>Cari slot kosong:</strong> <code>GET /api/schedules/free-time?date=YYYY-MM-DD</code> &rarr; Menerima list <code>free_time</code> di kalender 24 jam.</div>
        </div>
        <div class="flex items-start gap-2">
          <span class="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold flex-shrink-0">3</span>
          <div><strong>Jadwalkan kegiatan pengerjaan:</strong> <code>POST /api/schedules</code> &rarr; Blok waktu pengerjaan tugas tanpa overlap.</div>
        </div>
        <div class="flex items-start gap-2">
          <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">4</span>
          <div><strong>Tandai tugas selesai:</strong> <code>PATCH /api/assignments/:id</code> dengan <code>{"status": "COMPLETED"}</code>.</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <div class="pt-6 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
    <span>Day2Day • Personal College Management System</span>
    <a href="/settings" class="text-indigo-400 hover:underline">Manage API Keys &rarr;</a>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
