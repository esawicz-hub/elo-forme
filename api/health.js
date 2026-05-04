// Vercel Serverless Function — réception des données Apple Health/Watch
// POST /api/health
//   Headers : Authorization: Bearer <HEALTH_TOKEN>
//   Body JSON : {
//     date: "2026-05-04",          // optionnel, défaut = aujourd'hui (timezone Europe/Paris)
//     steps: 8247,
//     activeKcal: 412,
//     distance: 5.2,                // km
//     exerciseMin: 28,
//     standHours: 9,
//     moveGoal: 500,                // optionnel
//     exerciseGoal: 30,             // optionnel
//     standGoal: 12                 // optionnel
//   }
//
// Stocke les données dans la même clé "elo-forme:state" (sous days[date].health)
// pour que la sync existante les récupère normalement côté app.

import { createClient } from 'redis';

const KEY = 'elo-forme:state';

let _client = null;
async function getClient() {
  if (_client && _client.isOpen) return _client;
  const url = process.env.KV_REDIS_URL || process.env.REDIS_URL;
  if (!url) throw new Error('Missing KV_REDIS_URL env var');
  _client = createClient({ url });
  _client.on('error', (err) => console.error('Redis error:', err));
  await _client.connect();
  return _client;
}

function ymdParis(d = new Date()) {
  // Format YYYY-MM-DD en heure de Paris (utile pour l'iOS Shortcut)
  const fmt = new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
  return fmt.format(d);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth simple via Bearer token (env var HEALTH_TOKEN)
  const expectedToken = process.env.HEALTH_TOKEN;
  if (!expectedToken) {
    return res.status(500).json({ error: 'Server misconfigured: HEALTH_TOKEN missing' });
  }
  const authHeader = req.headers.authorization || '';
  const providedToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (providedToken !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const date = body.date || ymdParis(new Date());

  // Garde-fou : seules ces clés sont acceptées
  const healthData = {
    steps: typeof body.steps === 'number' ? body.steps : null,
    activeKcal: typeof body.activeKcal === 'number' ? body.activeKcal : null,
    distance: typeof body.distance === 'number' ? body.distance : null,
    exerciseMin: typeof body.exerciseMin === 'number' ? body.exerciseMin : null,
    standHours: typeof body.standHours === 'number' ? body.standHours : null,
    moveGoal: typeof body.moveGoal === 'number' ? body.moveGoal : null,
    exerciseGoal: typeof body.exerciseGoal === 'number' ? body.exerciseGoal : null,
    standGoal: typeof body.standGoal === 'number' ? body.standGoal : null,
    updatedAt: Date.now()
  };

  try {
    const r = await getClient();

    // Lit le state actuel, met à jour days[date].health, écrit
    const raw = await r.get(KEY);
    const state = raw ? JSON.parse(raw) : { days: {}, settings: { kcalTargetSport: 1650, kcalTargetRest: 1450 }, lastModified: 0 };
    if (!state.days) state.days = {};
    if (!state.days[date]) state.days[date] = {};
    state.days[date].health = healthData;
    state.lastModified = Date.now();

    await r.set(KEY, JSON.stringify(state));

    return res.status(200).json({ ok: true, date, health: healthData });
  } catch (err) {
    console.error('API /health error:', err);
    return res.status(500).json({ error: 'Server error', detail: String((err && err.message) || err) });
  }
}
