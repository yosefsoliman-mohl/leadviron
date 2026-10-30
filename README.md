# Leadviron — Interactive Demo

Leadviron is a Lead Intelligence platform: lead intake, enrichment, qualification, scoring, outreach, inbox, workflows, sales follow-up and analytics in one workspace.

This repository holds the **first demo release**: an interactive UI of all 36 screens from the project brief, running on fictional sample data. There is no backend, no accounts and no real integrations yet.

## Run locally

It is a static site with no build step. Serve the folder with any static server:

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173 and click **Open Demo**.

## How the demo behaves

- **Landing page** at the site root explains the platform (generation, enrichment, qualifying, scoring, conversations, automation) and links into the demo. Client logos in `assets/clients/` come from Simple Icons and Wikimedia Commons.
- **Login → Open Demo → Dashboard.** Open Demo needs no credentials and creates no account. Sign In is shown but disabled until the accounts phase.
- **Demo data** badge stays visible. Workspace shows 1,240 leads; scenarios use the *KSA Business Prospects* cohort of 120 leads (72 complete, 36 partial, 12 no external match).
- **Session-only changes.** Edits (stage moves, merges, task completion, settings…) are kept in `sessionStorage`. **Reset Demo** (avatar menu, top right) restores the original scenario.
- **Simulated actions.** Publish, Send, Connect, Enrich, Test and similar buttons show a clear simulation notice. Nothing is sent, no paid enrichment runs, and no external account is changed.
- **Navigation** follows the lead journey: Dashboard → Lead Generation (Outreach, Upload List, From Social Media) → All Leads → Lead Enrichment → Lead Qualifying → Lead Scoring → Workflows → Conversations → Sales Workspace → Analytics → Settings. Settings holds Organization pages, **Lead Settings** (Web Forms, Duplicate Review, Ingestion Monitor), Integrations and the optional Workspace Setup. Links from the first release redirect to the new paths.

## Structure

```
index.html          App entry
css/app.css         Design system (white / blue / gray)
css/pages-*.css     Page-group styles
js/app.js           Hash router, sidebar, top bar, Reset Demo
js/store.js         Demo seed data + session state
js/ui.js            Icons and UI helpers
js/shared.js        Shared dialogs
js/pages/*.js       One module per screen
assets/             Logo and favicon
```

Routes use hash URLs (for example `#/demo/leads/LD-1048`) so the site works on GitHub Pages without server rewrites.

## Deploy (GitHub Pages)

Push to the default branch, then in the repository: **Settings → Pages → Deploy from a branch → `main` / root**. The site is served at `https://<user>.github.io/<repo>/`.

---

Powered by Upshifters.
