<img width="3099" height="619" alt="Asset 1@300x-8" src="https://github.com/user-attachments/assets/ed81298d-2170-4c44-936a-d000b72008a9" />
AI-powered emergency response system for processing cases from the Personal Alert Button (PAB) installed in HDB flats where seniors live alone or with other seniors. 

---

## Overview

OnePress consists of two main modules:

- **Recorder** — Simulates the PAB; records audio and captures user details, then uploads everything to Supabase.
- **Dashboard** — Displays cases with AI-powered transcription, translation, priority assignment, and summaries.


## Tech Stack

- **Frontend:** SvelteKit 2 / Svelte 5
- **Backend:** Supabase (Storage + PostgreSQL)
- **AI:** Gemini API Key (For Triage)
- **Icons:** Lucide Svelte


## Getting Started

### Prerequisites

- Node.js
- A Supabase project
- An AI API key

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Set up Supabase

Run the following in your Supabase **SQL Editor**:

```sql
-- Create the cases table
CREATE TABLE cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  age INTEGER,
  nric TEXT,
  address TEXT,
  phone TEXT,
  audio_url TEXT NOT NULL
);

ALTER TABLE cases DISABLE ROW LEVEL SECURITY;
```

Then in **Storage**:

1. Create a **public** bucket named `Recordings` — *the name is case-sensitive and must match exactly*
2. Add storage policies via the **SQL Editor**:

```sql
CREATE POLICY "Allow public upload"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'Recordings');

CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'Recordings');
```

### 4. Run the dev server

```bash
npm run dev
```
## Project Structure

```
src/
├── lib/
│   ├── supabaseClient.js        # Supabase client init
│   ├── assets/
│   └── styles/
│       └── global.css           # Global theme & variables
├── routes/
│   ├── +layout.svelte           # Root layout
│   ├── +page.svelte             # Landing page — navigate to Recorder or Dashboard
│   ├── CardLink.svelte          # Reusable card link component
│   ├── record/
│   │   └── +page.svelte         # Audio recorder + form + Supabase upload
│   └── dashboard/
│       └── +page.svelte         # Dashboard (WIP) — AI-powered case viewer
```


made with ❤️ by ChadGPT
