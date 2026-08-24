# تكوين (Takween)

> كوّن فريقك. شارك في مشروعك. لا تخلي نقص الأعضاء يوقف فكرتك.

**Takween** is a full-stack web app that connects two kinds of people: those who have a hackathon/project idea and need teammates, and those who have skills and are looking for a team to join. Built as a real, working MVP — with authentication, a relational database, CRUD operations, and a join-request workflow — not just a UI mockup.

🔗 Live demo: _add your deployed URL here_
📸 Screenshots: _add screenshots in `/docs/screenshots` and link them here_

---

## Features

- **Authentication** — email/password sign up, login, logout, and session-aware routing (Supabase Auth).
- **Listings** — create, view, close/reopen, and delete opportunities ("looking for members" or "looking for a team").
- **Explore & discover** — public listing feed with search and filters (type, mode, location, direction).
- **Skills tagging** — free-form required skills vs. owner's skills per listing, stored relationally and reused across listings.
- **Join requests** — applicants send a short message; listing owners accept or reject; contact info is revealed only after acceptance.
- **Dashboard** — a single place to track listings you posted, requests you sent, and requests you received.
- **Public profiles** — every user has a shareable profile page showing their bio, skills context, and open listings.
- **Empty / loading / error states** and inline form validation throughout.

### Deliberately out of scope for v1
In-app chat, AI-based matching, notifications, and payments — kept out on purpose to ship a focused, working MVP first. See [`ROADMAP.md`](./ROADMAP.md) for what's next.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | [Next.js 14](https://nextjs.org) (App Router) | Server Components + Server Actions remove the need for a separate API layer for CRUD. |
| Language | TypeScript | Type safety across UI, server actions, and data shapes. |
| Styling | Tailwind CSS | Fast, consistent, easy to keep the RTL Arabic UI clean. |
| Backend / DB | [Supabase](https://supabase.com) (PostgreSQL + Auth) | Managed Postgres with Row Level Security handles auth + data access without a custom backend. |

---

## Database schema

Five tables, defined in [`supabase/schema.sql`](./supabase/schema.sql):

```
profiles         one row per authenticated user (auto-created on sign up)
skills           shared, de-duplicated skill tags (e.g. "React", "UI/UX Design")
listings         an opportunity: looking_for = 'members' | 'team'
listing_skills   join table: skill required by OR owned by a listing (kind = 'required' | 'owned')
join_requests    an applicant's request to join a listing, with status pending/accepted/rejected
```

Relationships:

```
profiles (1) ──< listings (owner_id)
listings (1) ──< listing_skills >── (1) skills
listings (1) ──< join_requests >── (1) profiles (applicant_id)
```

Row Level Security is enabled on every table:
- Profiles and open listings are publicly readable.
- Only the owner can edit/delete their own listing or profile.
- Only a listing's owner can see and act on its join requests; applicants can see and withdraw only their own.

---

## Getting started

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com) → New project. Once it's ready, open **SQL Editor** and run the full contents of [`supabase/schema.sql`](./supabase/schema.sql). This creates all tables, RLS policies, the auto-profile trigger, and a small starter set of common skills.

### 2. Configure environment variables
```bash
cp .env.example .env.local
```
Fill in the two values from **Project Settings → API** in Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

### 3. Install and run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 4. (Optional) Disable email confirmation for faster local testing
In Supabase: **Authentication → Providers → Email**, turn off "Confirm email" so sign-up logs the user in immediately instead of requiring a confirmation email.

---

## Project structure

```
app/
  page.tsx                landing page
  login/, signup/          auth pages
  explore/                 public listing feed with search + filters
  listings/new/            create-listing form
  listings/[id]/           listing detail, join-request flow, owner panel
  dashboard/                logged-in user's control center
  profile/[id]/, profile/edit/   public + editable profile
  actions/                 server actions (listings.ts, requests.ts, profile.ts) — all CRUD lives here
components/                 shared UI: Navbar, Footer, ListingCard, SkillBadge, EmptyState
lib/supabase/               browser client, server client, and auth middleware
supabase/schema.sql          full database schema + RLS policies
types/database.ts            shared TypeScript types and Arabic label maps
```

---

## Future improvements

See [`ROADMAP.md`](./ROADMAP.md).

---

## License

MIT — feel free to fork and adapt for your own portfolio.
