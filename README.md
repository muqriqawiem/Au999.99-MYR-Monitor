# Agent Instructions for Au 999.9 Monitor

## Purpose
This repository is a small browser-only Next.js app for monitoring Au 999.9 gold prices in Malaysian Ringgit (MYR) per gram.

## What to expect
- A single-page dashboard in `app/page.tsx`.
- Client-only behavior: `"use client"` is required and React hooks are used directly in the page.
- No custom server API or backend service in this repo.
- Live data is fetched from external APIs in the browser.

## Key workflows
- `npm install`
- `npm run dev` to run locally
- `npm run build` to validate Next.js compilation
- `npm run lint` to check ESLint rules

## Important conventions
- `app/page.tsx` is the main app entry point and contains most of the UI, data fetch logic, and translations.
- `app/layout.tsx` defines metadata and global fonts.
- `app/globals.css` holds global styles; Tailwind v4 is used across the app.
- `lib/utils.ts` may be used for shared utilities.
- `hooks/use-mobile.ts` contains device detection logic.

## Data sources and behavior
- Gold spot price endpoint: `https://api.gold-api.com/price/XAU`
- USD/MYR exchange rate endpoint: `https://open.er-api.com/v6/latest/USD`
- OHLC market data requires an API key for `api.gold-api.com`.
- API key is stored in browser `localStorage` under `au999_goldapi_key`.
- The app converts XAU/USD to MYR per gram using the constant `31.1035` grams per troy ounce.

## Best practices for AI agents
- Preserve the existing user-facing price math and explanation flow.
- Do not introduce server-side runtime or a backend service in this repository.
- Keep any API key handling strictly client-side and do not hardcode secrets in source control.
- Use existing translation keys and avoid duplicating text in multiple places.
- Keep changes small and aligned with the current app structure.

## Notes for future customization
- If there is a need to add a backend or data ingestion layer later, create a separate instruction file for that domain.
- For UI/UX guidance, a dedicated `AGENTS-UI.md` or custom agent focused on dashboard behavior may be useful.
