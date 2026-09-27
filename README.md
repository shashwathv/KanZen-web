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

## Design

The look is a kanji drill book: faint graph-paper pages, indigo ink for text,
a teacher's red pen (朱) for marks and errors, and a yellow highlighter for
"you are here" states. Kanji are set in **Klee One**, a textbook-style face
that shows correct handwritten forms; everything else uses **M PLUS 2**.

- `PaperBackground` draws the whole site onto 田字格 practice paper (two fixed
  canvases). A few squares hold faint pencil kanji, some with a faded red
  hanamaru. Moving the pointer writes kanji into nearby squares, which fade
  like erased pencil. It only animates while something is fading, and
  reduced-motion settings turn the writing off. Strengths are set per theme
  with `--ghost-alpha`, `--trace-alpha` and `--mark-alpha`.
- `KanjiBox` writes text into genkouyoushi practice squares, one per character.
- `Hanamaru` is the red spiral-flower mark teachers draw on good work. It's
  drawn when you grade a demo card "Good" and when a deck is ready. Keep it
  for those moments.
- Colours are CSS variables in `src/index.css`, defined for both themes.
  Use `var(--ink)`, `var(--shu)` and so on rather than hard-coded values.
- Components style themselves with the shared classes in `index.css` (`.btn`,
  `.btn-ink`, `.sheet`, `.input`, …). Keep properties a `:hover` rule changes
  out of inline styles, because inline styles win on specificity.

Because this is a single-page app, the static host must rewrite unknown paths
to `index.html` so that refreshing on `/app` or `/dashboard` works.
