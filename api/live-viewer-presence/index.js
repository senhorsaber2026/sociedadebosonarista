import { neon } from '@neondatabase/serverless';

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
};

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(200).end();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return res.status(500).json({ error: 'DATABASE_URL não configurada.' });
  const sql = neon(databaseUrl);

  try {
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { liveSessionId, participantIdentity } = body;

      if (!liveSessionId || !participantIdentity) {
        return res.status(400).json({ error: 'Transmissão e identidade do participante são obrigatórias.' });
      }

      const [existing] = await sql`
        SELECT * FROM live_viewer_presence
        WHERE live_session_id = ${liveSessionId} AND participant_identity = ${participantIdentity}
        LIMIT 1
      `;

      if (existing) {
        await sql`
          UPDATE live_viewer_presence
          SET last_seen_at = NOW(), left_at = NULL
          WHERE id = ${existing.id}
        `;
        return res.status(200).json({ success: true, presence: existing });
      }

      const [inserted] = await sql`
        INSERT INTO live_viewer_presence (live_session_id, participant_identity, joined_at, last_seen_at)
        VALUES (${liveSessionId}, ${participantIdentity}, NOW(), NOW())
        RETURNING *
      `;
      return res.status(201).json(inserted);
    }

    if (req.method === 'GET') {
      const { liveSessionId } = req.query || {};
      if (!liveSessionId) return res.status(400).json({ error: 'Transmissão é obrigatória.' });

      const presences = await sql`
        SELECT * FROM live_viewer_presence
        WHERE live_session_id = ${liveSessionId}
        ORDER BY joined_at DESC
      `;
      return res.status(200).json(presences);
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error('Erro na API de presença:', error);
    return res.status(500).json({ error: 'Erro interno no servidor de presença.' });
  }
}
