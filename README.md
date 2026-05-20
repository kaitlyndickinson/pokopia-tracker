# Pokopia Tracker

A lightweight habitat and pokemon tracker for Pokopia built to track personal progress. Deployed on Vercel using localStorage; no account needed. I love this game so much.

**[Live Demo →](https://pokopia-tracker-tau.vercel.app)**

## Features

There are other community trackers out there that are way more comprehensive, this one is intentionally personal and focused on what I actually needed while playing.

- **Habitats view**: Habitats organized into Still Needed / Completed sections, with filters for region, category (tall grass, flower bed, fishing spot, etc.), and name search. Click any card to check off individual Pokémon, mark all at once, or track partial progress.
- **Pokédex view**: Pokémon checklist with caught/uncaught tracking, region tags, and a toggle to view a unified alphabetical list instead of split sections.
- **CSV backup**: export and import your Pokédex progress or full habitat progress as CSVs. The app nudges you to export if it's been a while, and auto-exports before a reset.
- **No account, no server**: everything lives in localStorage. I deployed it on Vercel so I could easily have it as a web app on my phone.

## Data / Current State
- 221 habitats (209 unique + 9 Palette Town stubs + 3 events)
- 303 Pokémon (includes Pokopia-exclusive Pokémon and counted-separately variant forms)

Habitat and Pokémon data was compiled from Serebii and community resources. The Pokémon list is treated as the source of truth; habitats are categorized and assigned to a region (Withered Wastelands, Bleak Beach, Rocky Ridges, Sparkling Skylands, Palette Town, Dream Island) based on where they were first catalogued. **Region assignments are approximate** — most habitats likely appear across all regions in-game, but the data here reflects where the habitat was sourced from rather than an exhaustive location list. Pokopia is still a relatively new game so the data may have gaps — PRs welcome if you spot something wrong.

## Tech Stack

React 19 · Vite · Pure CSS

## Running Locally

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).
