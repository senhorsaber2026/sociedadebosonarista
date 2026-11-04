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
    const { liveSessionId, senderUserId, visitorId, displayName, message } = body;

    if (!liveSessionId) return res.status(400).json({ error: 'Transmissão é obrigatória.' });
    if (!message || !message.trim()) return res.status(400).json({ error: 'Mensagem é obrigatória.' });
    if (message.length > 500) return res.status(400).json({ error: 'Mensagem excede 500 caracteres.' });
    if (!displayName || !displayName.trim()) return res.status(400).json({ error: 'Nome de exibição é obrigatório.' });

    // Sanitização: escape de HTML para prevenir XSS
    const safeMessage = message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    const safeDisplayName = displayName
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .substring(0, 80);

    // Verifica se a transmissão existe e está ativa
    const [session] = await sql`SELECT id, status FROM live_sessions WHERE id = ${liveSessionId} LIMIT 1`;
    if (!session) return res.status(404).json({ error: 'Transmissão não encontrada.' });
    if (session.status !== 'live') return res.status(400).json({ error: 'Transmissão não está ao vivo.' });

    // Rate limit simples: verifica se há mensagem duplicada recente do mesmo remetente
    const recent = await sql`
      SELECT id FROM live_chat_messages
      WHERE live_session_id = ${liveSessionId}
        AND message = ${safeMessage}
        AND created_at > NOW() - INTERVAL '10 seconds'
        AND ((sender_user_id = ${senderUserId || null}) OR (visitor_id = ${visitorId || null}))
      LIMIT 1
    `;
    if (recent.length > 0) {
      return res.status(429).json({ error: 'Mensagem duplicada. Aguarde antes de enviar novamente.' });
    }

    const [inserted] = await sql`
      INSERT INTO live_chat_messages (live_session_id, sender_user_id, visitor_id, display_name, message, message_type)
      VALUES (${liveSessionId}, ${senderUserId || null}, ${visitorId || null}, ${safeDisplayName}, ${safeMessage}, 'user')
      RETURNING *
    `;

    return res.status(201).json(inserted);
  } catch (error) {
    console.error('Erro ao enviar mensagem de chat:', error);
    return res.status(500).json({ error: 'Erro interno ao enviar mensagem.' });
  }
}
