# QA Command Center

A Next.js 14 + Tailwind CSS web app that acts as a lightweight command center for manual regression testing. Capture scenarios, monitor pass/fail rates, and review the latest activity straight from a single page optimized for Vercel.

## Features

- Test suite summary cards with live pass/fail/completion metrics.
- Fast-add form for creating structured manual test scenarios.
- Filterable catalog table with owner, priority, status, and quick status update actions.
- Signal panel highlighting failure density and coverage notes.
- Activity feed that tracks the 10 most recent changes across the suite.

## Tech Stack

- Next.js App Router (TypeScript)
- Tailwind CSS
- ESLint (Next.js config)

## Local Development

```bash
cd app
npm install
npm run dev
```

Visit `http://localhost:3000` to explore the dashboard. Lint and build checks are available via `npm run lint` and `npm run build`.

## Deployment

The project is already configured for Vercel. To deploy a new production build:

```bash
cd app
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-0de6137c
```

Production URL: `https://agentic-0de6137c.vercel.app`

## Notes

- Test cases and activity timeline are stored client-side for demo purposes.
- `crypto.randomUUID()` is used for ID generation within the browser.
- Update the static seed data in `src/app/page.tsx` to reflect your own regression pack.
