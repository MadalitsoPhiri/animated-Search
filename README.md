# Drift Search

Drift Search is a single-page Next.js app with two phases:
- A scroll-reactive cinematic hero with layered motion and parallax.
- A search chat console that calls a real search API (Brave or Tavily) through a server route.

## Assignment Notes

Animation concept:
- A stylized dawn landscape where celestial and terrain layers move at different speeds.
- Scroll drives at least three motion phases: sky shift, moon transform, and layered terrain movement.
- The handoff into chat is gradual through opacity and layout continuity.

Tech stack:
- Next.js (App Router)
- React + TypeScript
- Framer Motion
- Tailwind CSS (with custom CSS for scene styling)

## Setup

1. Install dependencies with Yarn:

```bash
yarn install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Add a real API key to `.env.local`:

```env
SEARCH_PROVIDER=brave
SEARCH_API_KEY=your_real_key_here
```

Supported providers in this codebase:
- `brave` via `https://api.search.brave.com/res/v1/web/search`
- `tavily` via `https://api.tavily.com/search`

4. Start development server:

```bash
yarn dev
```

## Scripts

- `yarn dev` - run local dev server
- `yarn build` - build production app
- `yarn start` - run production server
- `yarn lint` - run lint checks

## What I would improve with more time

- Add keyboard navigation and richer a11y semantics for result cards.
- Add provider-specific score metadata and citation formatting.
- Add animation tuning controls and reduced-motion variants.
- Add automated tests for API route adapters.
