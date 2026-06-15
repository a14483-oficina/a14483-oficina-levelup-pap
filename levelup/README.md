# LevelUP

> Transforma hábitos saudáveis em aventuras RPG.

LevelUP is a gamified fitness and wellness PWA built for young people aged 16–22.
Daily/weekly missions reward XP and items that power up an RPG character.

## Tech stack

- **React 19** + **Vite 8** (no TypeScript — `.jsx` files)
- **React Router v7** — routing with lazy-loaded pages
- **Supabase** — auth, PostgreSQL, storage
- **Zustand** — small focused stores per domain
- **CSS Modules** + CSS custom properties (no Tailwind, no CSS-in-JS)
- **vite-plugin-pwa** (Workbox) — installable PWA with offline support
- **react-hot-toast** — user feedback toasts
- **lucide-react** — icon set

## Getting started

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure environment variables
cp .env.example .env
# Edit .env and fill in:
#   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
#   VITE_SUPABASE_ANON_KEY=<your anon / publishable key>
#
# IMPORTANT: never put the service_role key in .env — only the anon/public key.

# 3. Run the dev server
npm run dev

# 4. Build for production
npm run build
npm run preview
```

## Phase 1 status (MVP — Foundation)

- [x] Project scaffold + dependencies + folder structure
- [x] Design tokens (Kraken Purple) in `src/styles/variables.css`
- [x] Global dark-theme styles + scrollbar + selection
- [x] Supabase client (`src/services/supabase.js`)
- [x] PWA configured with offline fallback (`public/offline.html`)
- [x] Auth: sign up, sign in, sign out, session restore + auto-refresh
- [x] AuthContext + Zustand `authStore`
- [x] Protected routes + redirect to `/login`
- [x] Login + Signup pages with form validation in pt-PT
- [x] Character creation flow (name → class → confirm)
- [x] Dashboard / Home with character hero + XP bar
- [x] Character page with stats and equipment placeholder
- [x] Profile page with avatar + account info + logout
- [x] Bottom navigation (mobile-first, 5 tabs)
- [x] Reusable UI primitives: Button, Card, Input, ProgressBar, Badge, Modal, Avatar, Spinner, EmptyState, Skeleton
- [x] Toast notifications wired to dark theme
- [x] All UI text in Portuguese (pt-PT)

## Folder structure

```
src/
├── components/
│   ├── layout/        # AppLayout, BottomNav, Header, ProtectedRoute
│   └── ui/            # Reusable primitives (one folder per component)
├── contexts/          # AuthContext + useAuthContext hook
├── hooks/             # useAuth, useCharacter, ...
├── lib/               # supabase.js (re-exports services/supabase.js)
├── pages/             # One folder per feature
├── services/          # Supabase queries (no business logic)
├── stores/            # Zustand stores
├── styles/            # variables.css, global.css, animations.css
└── utils/             # constants, helpers, validators
```

## Database

This project relies on a Supabase project with the schema described in
`/home/ubuntu/agent.md` (8 tables: `users`, `characters`, `items`,
`character_items`, `missions`, `user_missions`, `streaks`, `rankings`).

All tables use Row Level Security (RLS). The frontend uses **only** the
public/anon key — security is enforced server-side by RLS policies.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production (outputs `dist/`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with ESLint |
