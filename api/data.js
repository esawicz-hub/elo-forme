// Vercel Serverless Function — sync des données de l'app
// GET  /api/data → renvoie le state stocké dans Redis
// POST /api/data → sauvegarde le state (body JSON) dans Redis
//
// Stockage : Redis Marketplace de Vercel (URL via KV_REDIS_URL),
// une seule clé "elo-forme:state".
// Concurrence : last-write-wins (strat. simple).

import { createClient } from 'redis';

const KEY = 'elo-forme:state';

// Client réutilisé entre invocations chaudes (Vercel garde la lambda)
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

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    const r = await getClient();

    if (req.method === 'GET') {
      const data = await r.get(KEY);
      const parsed = data
        ? JSON.parse(data)
        : { days: {}, settings: { kcalTarget: 1500 }, lastModified: 0 };
      return res.status(200).json(parsed);
    }

    if (req.method === 'POST') {
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      if (!body || typeof body !== 'object' || !body.days) {
        return res.status(400).json({ error: 'Invalid state' });
      }
      if (!body.lastModified) body.lastModified = Date.now();
      await r.set(KEY, JSON.stringify(body));
      return res.status(200).json({ ok: true, lastModified: body.lastModified });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API /data error:', err);
    return res
      .status(500)
      .json({ error: 'Server error', detail: String((err && err.message) || err) });
  }
}
