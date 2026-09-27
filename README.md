# Kanzen — web frontend

Photograph a kanji worksheet or textbook page and get an Anki deck back. This
repo is the React frontend; the vision-model backend lives in
[shashwathv/KanZen](https://github.com/shashwathv/KanZen).

## How it works

1. **Upload** (`/app`) — up to 5 images are posted to `POST /v1/process`.
   Oversized photos are shrunk client-side first (`src/lib/imageCompress.js`)
   to stay under the API's 15 MB per-image limit.
2. **Processing** — the page polls `GET /v1/jobs/:id` every 3s until the job is
   `done` or `failed`. The step list shown meanwhile is a timed animation, not
   live backend progress.
3. **Review** — extracted cards are editable before anything is built.
4. **Build** — `POST /v1/build` returns a signed `.apkg` download URL. If the
   user is signed in, the deck is also saved to their dashboard.

Auth (email/password and Google) and the saved-decks list use Supabase.

## Getting started

Requires Node 18+.

```sh
npm install
cp .env.example .env   # then fill in the values below
npm run dev
```

| Variable                 | Purpose                                                        |
| ------------------------ | -------------------------------------------------------------- |
| `VITE_API_URL`           | Backend base URL, without `/v1` (e.g. `https://api.example.com`) |
| `VITE_SUPABASE_URL`      | Supabase project URL — optional; without it the tool still works but sign-in and the dashboard are disabled |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key                                     |
| `VITE_GOOGLE_CLIENT_ID`  | Google OAuth client ID — optional; the Google button is hidden without it |

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server            |
| `npm run build`   | Production build into `dist/`        |
| `npm run preview` | Serve the production build locally   |
| `npm run lint`    | Run ESLint                           |

## Project layout

```
src/
  main.jsx              Providers (router, theme, auth) and app mount
  router.jsx            Routes; everything except the landing page is lazy-loaded
  index.css             Design tokens, shared classes and responsive rules
  constants/            API URLs, upload limits, processing steps
  context/              AuthContext (Supabase session), ThemeContext (dark/light)
  hooks/useJobPoller.js Polls a processing job until it finishes
  lib/                  Supabase client, client-side image compression
  pages/                Landing, AppPage (the tool), Login, Dashboard
  components/
    layout/             Layout shell, Header, Footer, BrandMark
    landing/            Landing page sections and the grid background
    tool/               Upload, processing, review, success and error views
```

## Styling conventions

Components use inline styles for one-off layout, and shared classes in
`src/index.css` for anything with hover/focus states or repeated across pages
(`.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.card`, `.input`, …). Keep
properties that a `:hover` rule changes out of inline styles — inline styles
win on specificity and would silently disable the hover.

Colours come from CSS variables defined for both themes; use `var(--jade)`
etc. rather than hard-coded values so light mode keeps working.

Because this is a single-page app, the static host must rewrite unknown paths
to `index.html` so that refreshing on `/app` or `/dashboard` works.
