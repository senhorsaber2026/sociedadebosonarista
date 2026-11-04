import { neon } from '@neondatabase/serverless';

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
};

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Método não permitido.' });

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return res.status(500).json({ error: 'DATABASE_URL não configurada.' });
  const sql = neon(databaseUrl);

  try {
    const { messageId, moderatorUserId, liveSessionId } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    if (!messageId || !moderatorUserId) {
      return res.status(400).json({ error: 'Mensagem e moderador são obrigatórios.' });
    }

    // Verifica se o moderador é admin
    const [moderator] = await sql`SELECT role FROM users WHERE id = ${moderatorUserId} LIMIT 1`;
    if (!moderator || (moderator.role !== 'admin' && moderator.role !== 'moderator')) {
      return res.status(403).json({ error: 'Apenas moderadores e administradores podem excluir mensagens.' });
    }

    const [message] = await sql`SELECT * FROM live_chat_messages WHERE id = ${messageId} LIMIT 1`;
    if (!message) return res.status(404).json({ error: 'Mensagem não encontrada.' });

    await sql`UPDATE live_chat_messages SET is_deleted = TRUE WHERE id = ${messageId}`;

    // Registra ação de moderação
    if (liveSessionId) {
      await sql`
        INSERT INTO live_moderation_actions (live_session_id, participant_identity, action, reason, moderator_user_id)
        VALUES (${liveSessionId}, ${message.sender_user_id || message.visitor_id || 'unknown'}, 'delete_message', 'Mensagem excluída por moderação', ${moderatorUserId})
      `;
    }

    return res.status(200).json({ success: true, message: 'Mensagem excluída.' });
  } catch (error) {
    console.error('Erro ao excluir mensagem:', error);
    return res.status(500).json({ error: 'Erro interno ao excluir mensagem.' });
  }
}
