# Elo Forme — Hellfest 2026

Suivi sport / hydratation / nutrition sur 7 semaines pour Hellfest 2026.

PWA installable sur iPhone, sync ordi ↔ téléphone via Vercel KV.

## Structure

- `public/index.html` — l'app (HTML/CSS/JS, pas de framework)
- `public/manifest.json` + `public/sw.js` — config PWA
- `api/data.js` — endpoint serverless (GET/POST) qui lit/écrit le state dans Vercel KV
- `vercel.json` — config Vercel (headers cache + service worker)

## Déploiement

Connecté à Vercel → auto-deploy à chaque push sur `main`.

Pour modifier l'app :
1. Édite `public/index.html`
2. `git add . && git commit -m "..." && git push`
3. Vercel redéploie automatiquement (~30s)

## Sync

Une seule clé KV (`elo-forme:state`) qui contient tout le state de l'app.
Stratégie : last-write-wins (timestamp `lastModified`).

Pour usage perso uniquement.
