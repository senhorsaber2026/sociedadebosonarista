import { neon } from '@neondatabase/serverless';

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
};

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(200).end();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return res.status(500).json({ error: 'DATABASE_URL não configurada.' });
  const sql = neon(databaseUrl);

  try {
    if (req.method === 'GET') {
      const { liveSessionId, status } = req.query || {};
      let query = `
        SELECT * FROM live_chat_reports WHERE 1=1
      `;
      const params = [];
      if (liveSessionId) { query += ` AND live_session_id = $${params.push(liveSessionId)}`; }
      if (status) { query += ` AND status = $${params.push(status)}`; }
      query += ` ORDER BY created_at DESC LIMIT 50`;
      const reports = await sql(query, params);
      return res.status(200).json(reports);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { liveSessionId, messageId, reporterIdentity, reason, details } = body;

      if (!liveSessionId || !messageId || !reporterIdentity || !reason) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
      }

      const [report] = await sql`
        INSERT INTO live_chat_reports (live_session_id, message_id, reporter_identity, reason, details, status)
        VALUES (${liveSessionId}, ${messageId}, ${reporterIdentity}, ${reason}, ${details || null}, 'pending')
        RETURNING *
      `;
      return res.status(201).json(report);
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error('Erro na API de denúncias:', error);
    return res.status(500).json({ error: 'Erro interno no servidor de denúncias.' });
  }
}
