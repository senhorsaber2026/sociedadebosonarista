import { neon } from '@neondatabase/serverless';

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
};

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return res.status(500).json({ error: 'DATABASE_URL não configurada.' });
  const sql = neon(databaseUrl);

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { liveSessionId, messageId, reporterIdentity, reason, details } = body;

    if (!liveSessionId || !messageId || !reporterIdentity || !reason) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    // Verifica se a mensagem existe
    const [message] = await sql`SELECT id FROM live_chat_messages WHERE id = ${messageId} AND live_session_id = ${liveSessionId} LIMIT 1`;
    if (!message) return res.status(404).json({ error: 'Mensagem não encontrada.' });

    const [report] = await sql`
      INSERT INTO live_chat_reports (live_session_id, message_id, reporter_identity, reason, details, status)
      VALUES (${liveSessionId}, ${messageId}, ${reporterIdentity}, ${reason}, ${details || null}, 'pending')
      RETURNING *
    `;

    return res.status(201).json(report);
  } catch (error) {
    console.error('Erro ao denunciar mensagem:', error);
    return res.status(500).json({ error: 'Erro interno ao denunciar mensagem.' });
  }
}
