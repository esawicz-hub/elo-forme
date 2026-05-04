// Vercel Serverless Function — sync des données de l'app
// GET  /api/data → renvoie le state stocké dans Vercel KV
// POST /api/data → sauvegarde le state (body JSON) dans Vercel KV
//
// Stockage : Vercel KV (Redis), une seule clé "elo-forme:state".
// Concurrence : last-write-wins (strat. simple).

import { kv } from '@vercel/kv';

const KEY = 'elo-forme:state';

export default async function handler(req, res) {
  // CORS headers (au cas où)
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    if (req.method === 'GET') {
      const data = await kv.get(KEY);
      return res.status(200).json(data ?? { days: {}, settings: { kcalTarget: 1500 }, lastModified: 0 });
    }

    if (req.method === 'POST') {
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      // Garde-fou : on n'écrit que si le body ressemble à un state valide
      if (!body || typeof body !== 'object' || !body.days) {
        return res.status(400).json({ error: 'Invalid state' });
      }
      // Stamp serveur si absent
      if (!body.lastModified) body.lastModified = Date.now();
      await kv.set(KEY, body);
      return res.status(200).json({ ok: true, lastModified: body.lastModified });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API /data error:', err);
    return res.status(500).json({ error: 'Server error', detail: String(err && err.message || err) });
  }
}
