# Day2Day — Personal College Management System

A personal college management web application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth & Google OAuth)**.

Version 1 is focused on a feature-complete **Schedule Management MVP** with 24-hour time auditing, recurring schedules, real-time conflict detection, and an API key system for AI agents and external automations.

---

## 🌟 Key Features

* **24-Hour Donut Chart & Time Audit**: Interactive SVG donut chart showing daily schedule breakdown (`1440 minutes = 100%`) with automatic **Free Time** calculation.
* **Smart Conflict Detection**: Real-time client-side & server-side conflict engine that prevents overlapping activities across one-off and recurring schedules (`max(start1, start2) < min(end1, end2)`).
* **Recurrence Engine**: Supports `none`, `daily`, `weekly`, `monthly`, `yearly`, and `custom` without generating redundant rows in the database.
* **Eisenhower Priority Matrix**: Classify activities into 4 distinct quadrants:
  * `IMPORTANT_URGENT` (Q1: Do First)
  * `IMPORTANT_NOT_URGENT` (Q2: Schedule)
  * `NOT_IMPORTANT_URGENT` (Q3: Delegate)
  * `NOT_IMPORTANT_NOT_URGENT` (Q4: Eliminate)
* **Timezone First (`Asia/Makassar`)**: All date and time calculations respect WITA (`Asia/Makassar`) regardless of server or client location.
* **Supabase Auth + Google OAuth**: Secure authentication with Row Level Security (RLS) guaranteeing data isolation.
* **Developer API Keys**: Generate secure `d2d_live_...` API keys hashed with SHA-256 for external AI agents or scripts.
* **Machine-Readable REST API & OpenAPI 3.1**: Standardized endpoints with OpenAPI documentation at `/api/docs`.

---

## 📁 Project Structure

```text
day2day/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── docs/route.ts              # OpenAPI 3.1.0 specification
│   │   │   ├── keys/route.ts              # API Keys (GET list, POST generate)
│   │   │   ├── keys/[id]/route.ts         # Revoke API Key
│   │   │   └── schedules/
│   │   │       ├── route.ts               # GET (date/range), POST create
│   │   │       ├── [id]/route.ts          # PATCH update, DELETE schedule
│   │   │       ├── today/route.ts         # GET today's schedule in Asia/Makassar
│   │   │       ├── free-time/route.ts     # GET free time slots for date
│   │   │       └── summary/route.ts       # GET daily statistics and percentages
│   │   ├── auth/
│   │   │   ├── callback/route.ts          # OAuth code exchange
│   │   │   └── login/page.tsx             # Google OAuth login + Demo Preview
│   │   ├── dashboard/page.tsx             # Central dashboard with summary & modules
│   │   ├── schedule/page.tsx              # Core Schedule feature & 24h visualization
│   │   ├── settings/page.tsx              # Account & API Key management
│   │   ├── globals.css                    # Tailwind CSS + Glassmorphism tokens
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppNavbar.tsx              # Asia/Makassar clock, user profile & logout
│   │   │   └── AppSidebar.tsx             # Navigation + Coming Soon module badges
│   │   └── schedule/
│   │       ├── FreeTimeModal.tsx          # Available free time slots modal
│   │       ├── ScheduleCard.tsx           # Activity item card with category badges
│   │       ├── ScheduleDatePicker.tsx     # Previous/Next Day navigation & date picker
│   │       ├── ScheduleFormModal.tsx      # Create/edit activity with conflict warning
│   │       ├── ScheduleList.tsx           # Activity timeline list & empty states
│   │       ├── SchedulePieChart.tsx       # 24-hour Donut chart with hover tooltips
│   │       └── ScheduleSummary.tsx        # Summary metric cards (Scheduled/Free %)
│   ├── lib/
│   │   ├── api/                           # API Auth, SHA-256 hashing, Response format
│   │   ├── schedule/                      # Recurrence, Conflict, Free-time, Validation
│   │   └── supabase/                      # Browser, Server, and Middleware clients
│   └── types/                             # TypeScript definitions & Supabase DB schema
├── supabase/
│   └── migrations/
│       └── 20260926000000_initial_schema.sql # Complete PostgreSQL DDL, RLS & Indexes
├── test-e2e.mjs                           # Automated E2E verification script
├── vitest.config.ts                       # Vitest unit test runner config
└── .env.example
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_TIMEZONE=Asia/Makassar
```

> **Note**: Even without live Supabase credentials configured yet, the project includes an instant **Demo / Dev Mode** so you can immediately explore and test the dashboard, schedule creation, 24h donut chart, and conflict detection!

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Setup & Database Migration

1. Open your project on [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor**.
3. Open `supabase/migrations/20260926000000_initial_schema.sql` and run the entire SQL script.
4. This script sets up:
   * `public.schedules` table with recurrence JSONB and constraints.
   * `public.api_keys` table for hashed token storage.
   * Performance indexes on `(user_id, start_date)` and `(key_hash)`.
   * Row Level Security (RLS) policies ensuring users only read, create, update, and delete their own data.
   * `handle_updated_at` trigger.

---

## 🔑 Google OAuth Setup in Supabase

1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create an **OAuth 2.0 Client ID** (Web Application).
3. Under **Authorized redirect URIs**, add your Supabase callback URL:
   ```text
   https://<your-project-id>.supabase.co/auth/v1/callback
   ```
4. Copy the **Client ID** and **Client Secret**.
5. In Supabase Dashboard, navigate to **Authentication -> Providers -> Google**.
6. Paste the Client ID and Client Secret, then enable Google Provider.
7. Under **URL Configuration**, set Site URL to:
   ```text
   http://localhost:3000
   ```
   and add Redirect URLs:
   ```text
   http://localhost:3000/auth/callback
   ```

---

## 🤖 REST API Reference

All endpoints accept authentication via:
* **Cookie Session** (automatic for logged-in website users)
* **Bearer Token**: `Authorization: Bearer <API_KEY>`

### 1. GET `/api/schedules`
Retrieve occurrences for a date or date range.
* Query: `?date=2026-09-26` or `?from=2026-09-26&to=2026-10-02`
```json
{
  "date": "2026-09-26",
  "timezone": "Asia/Makassar",
  "activities": [
    {
      "id": "3e315796-66bb-4651-b1fe-8df63ffe7810",
      "title": "Kuliah Algoritma",
      "category": "IMPORTANT_URGENT",
      "start": "08:00",
      "end": "10:00",
      "duration_minutes": 120,
      "repeat_type": "none"
    }
  ]
}
```

### 2. GET `/api/schedules/today`
Retrieve activities for today in `Asia/Makassar` (WITA).

### 3. GET `/api/schedules/free-time`
Calculate available free-time windows in the 24-hour day.
```json
{
  "date": "2026-09-26",
  "free_time": [
    { "start": "00:00", "end": "08:00", "duration_minutes": 480 },
    { "start": "10:00", "end": "10:30", "duration_minutes": 30 },
    { "start": "12:00", "end": "24:00", "duration_minutes": 720 }
  ]
}
```

### 4. GET `/api/schedules/summary`
Get daily time utilization stats.
```json
{
  "date": "2026-09-26",
  "total_minutes": 1440,
  "scheduled_minutes": 210,
  "free_minutes": 1230,
  "scheduled_percentage": 14.58,
  "free_percentage": 85.42,
  "activity_count": 2
}
```

### 5. POST `/api/schedules`
Create an activity with automatic conflict checking.
```json
{
  "title": "Belajar Next.js",
  "category": "IMPORTANT_NOT_URGENT",
  "date": "2026-09-26",
  "start": "19:00",
  "end": "21:00",
  "repeat": {
    "type": "weekly",
    "interval": 1,
    "days": ["MONDAY", "WEDNESDAY"]
  }
}
```
* If conflict occurs, returns `409 Conflict`:
```json
{
  "success": false,
  "error": {
    "code": "SCHEDULE_CONFLICT",
    "message": "This activity overlaps with: Kuliah Algoritma (08:00–10:00)"
  }
}
```

### 6. POST `/api/keys`
Generate a new API key.
```json
{
  "name": "AI Assistant Bot"
}
```
Returns:
```json
{
  "message": "API Key generated successfully. Copy it now, it will not be shown again.",
  "key": "d2d_live_49c2aec...",
  "apiKey": {
    "id": "uuid",
    "name": "AI Assistant Bot",
    "key_prefix": "d2d_live_49c2a",
    "created_at": "2026-09-25T15:54:13.123Z"
  }
}
```

---

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```
Runs 11 test suites covering recurrence rules, conflict overlap detection, free-time calculation, daily summary math, Zod schemas, and SHA-256 API key generation.

### Run Automated E2E REST API Tests
```bash
node test-e2e.mjs
```
Runs an automated 10-step end-to-end integration test creating API keys, querying today in `Asia/Makassar`, scheduling activities, validating 409 conflict detection, calculating free-time slots, patching, and deleting.
