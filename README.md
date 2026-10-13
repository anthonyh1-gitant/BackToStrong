# Back to Strong

A mobile-first, guest-first strength-routine MVP built with React, TypeScript,
Vite, Lucide icons, and Zod. No account, database, or AI API key is required.

## Run and build

Use Node.js 24 (tested with 24.19.0) and npm 11. With nvm: `nvm install && nvm use`.

```sh
npm ci
npm run dev
```

```sh
npm run lint
npm run test:unit
npm run build
npm test
```

`build` checks TypeScript and outputs a static website to `dist/`.
`npm run preview` serves the production build. By default, deploy `dist/` at the root of a
static HTTPS origin. Set `VITE_BASE_PATH` to deploy beneath a subdirectory. Navigation uses URL hashes, so no server-side route rewrites
are required. The production service worker and manifest provide installability
and cached offline reopening in browsers that support them. Development mode
does not register the worker. No external fonts, videos, or remote APIs are loaded.

## Browser verification

`npm test` starts its own production server on port 4175, then runs Playwright
on desktop and phone in light and dark modes. It requires a prior `npm run build`.
The cloud environment supplies `/usr/bin/chromium`. Elsewhere, set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` to your installed Chromium/Chrome binary.
Tests include axe accessibility checks; these do not replace a human audit.

Browser screenshots and failure traces are ignored outputs in `test-results/`.
Unit tests run with Node's test runner and cover template constraints, shorter
variants, duplicate prevention, and storage-schema validation.

## Try the main journey

1. Choose **Build my plan**. Select a goal, experience, frequency, time, equipment,
   and training days. Movement preferences are optional. Reported pain, injury,
   restrictions, or uncertainty stop plan creation and pause sample starts.
2. Skip or read the short walkthrough. In **Today**, preview your exercises or
   start the session. **I have less time** uses the fixed 20-minute variant.
3. Enter repetitions and optional kg, then check each set to save it immediately.
   Use the optional rest timer, predefined swaps, or skip remaining sets.
4. Refresh mid-session: logs remain. **Save & leave** returns to Today, where
   **Resume workout** restores the session. Finish normally or finish early.
5. Save an optional effort rating and note. **Progress** shows only actual logged
   sessions and sets. After a second workout, optional feedback is offered.
6. In **Plan**, change training days. In Today, move the next session independently.
   In **Settings**, try light/dark/system appearance, export data, or delete it.
   Feedback and optional pricing-interest answers are saved locally, not sent.

## Implementation

- `src/model.ts`: validated local data model, 15-exercise library, deterministic
  equipment-specific A/B/C templates, shorter variants, completion rules.
- `src/App.tsx`: navigation, theme, save/recovery errors, health-concern gate.
- `src/Onboarding.tsx`: five short onboarding steps and safety stop.
- `src/WorkoutPlayer.tsx`: persistent set logs, previous values, swaps, skips,
  rest timer, interruption recovery, and early completion.
- `src/Dashboard.tsx`: Today, Plan, completion, and actual progress/history.
- `src/Settings.tsx`: appearance, data export/deletion, consent, local feedback,
  and clearly labelled A$12.99/month pricing research.
- `public/sw.js`: caches only the static production shell/assets. Personal data
  stays in browser localStorage under `back-to-strong.v1`.

## Honest limits before a public beta

**The exercise templates, substitutions, movement cues, volume, and safety wording
require qualified trainer review before a public training launch. No professional
review has taken place.** The app does not assess medical suitability. The gate
relies on self-reported answers; it cannot verify professional clearance.

There are no technique demonstrations or licensed videos. Exercise icons are
explicitly decorative. There is no automatic load increase or AI prescription.
Weight is in kilograms; machine load is as displayed, dumbbell load is per dumbbell.
Workout duration is elapsed wall time and includes interruptions and breaks.
The optional rest countdown is not restored after a page refresh.

Guest data is private to this browser and origin. It is not synced or backed up;
clearing browser storage loses it. Exports include preferences and private notes.
There is no import flow yet. Changes are committed only after a successful local
save. Unreadable saved records are preserved until explicitly reset. Multi-tab
editing is not coordinated; use one tab for logging a session.

There is no cloud feedback delivery, aggregate market-test analytics, owner
view, authentication, payment, or subscription. Consent enables event names and
timestamps only in a local export; notes, health details, and feedback text never
appear in analytics events. Interested pricing answers never create a payment.

Before inviting real users: review exercise content, review accessibility on
actual devices (including iOS PWA behavior), choose static HTTPS hosting, and
review privacy/feedback procedures. No legal or medical compliance is claimed.

## Cloud environment

Use the existing `/workspace/BackToStrong` checkout. Cloud tasks are already
isolated; do not create a Git worktree unless requested.

```sh
npm --cache /workspace/.cache/npm ci --no-fund --no-audit
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Server processes restart in each new cloud task. This workspace does not expose
a shareable web preview URL. The app has been exercised via internal browser
requests, and can be deployed as static files once hosting is selected.

The repository started empty. The MVP and deployment workflow are intended for
the `main` branch. Preserve local changes when refreshing this checkout.


## Run on GitHub Pages

The repository includes `.github/workflows/pages.yml`. Every push to `main`
builds and publishes the static website with the `/BackToStrong/` base path.
No application secrets or external hosting account are needed.

One-time activation (repository owner):

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Open **Actions → Publish website to GitHub Pages → Run workflow** on `main`
   if the initial run failed before Pages was enabled.
4. Wait for both build and deploy jobs to pass. The deployment output provides
   the live website URL, normally `https://anthonyh1-gitant.github.io/BackToStrong/`.

GitHub Pages publishes a publicly reachable site; local workout records are not
uploaded. Availability for a private repository depends on your GitHub plan.
Do not change repository visibility merely to enable hosting without considering
what repository contents would become public. No clinical/trainer review is
implied by deployment: the app remains an explicitly labelled sample beta.

To reproduce Pages validation in Bash:

```sh
VITE_BASE_PATH=/BackToStrong/ npm run build
VITE_BASE_PATH=/BackToStrong/ npm test
```

For a root-origin deployment, run `npm run build` without that variable. The
manifest, static assets, and service worker support both deployment paths.
