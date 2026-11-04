import { neon } from '@neondatabase/serverless';

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
};

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return res.status(500).json({ error: 'DATABASE_URL não configurada.' });
  const sql = neon(databaseUrl);

  try {
    const { liveSessionId } = req.query || {};
    const limit = parseInt(req.query.limit || '50', 10);
    const offset = parseInt(req.query.offset || '0', 10);

    if (!liveSessionId) return res.status(400).json({ error: 'Transmissão é obrigatória.' });

    const messages = await sql`
      SELECT id, live_session_id as liveSessionId, sender_user_id as senderUserId,
             visitor_id as visitorId, display_name as displayName, message,
             message_type as messageType, is_deleted as isDeleted, created_at as createdAt
      FROM live_chat_messages
      WHERE live_session_id = ${liveSessionId}
        AND is_deleted = FALSE
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return res.status(200).json(messages.reverse());
  } catch (error) {
    console.error('Erro ao buscar histórico de chat:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar histórico.' });
  }
}
