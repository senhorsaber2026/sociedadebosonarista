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
    const { id } = req.query || {};
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { participantIdentity, action, reason, moderatorUserId } = body;

    if (!id || !participantIdentity || !action || !moderatorUserId) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    const [moderator] = await sql`SELECT role FROM users WHERE id = ${moderatorUserId} LIMIT 1`;
    if (!moderator || (moderator.role !== 'admin' && moderator.role !== 'moderator')) {
      return res.status(403).json({ error: 'Apenas moderadores e administradores podem executar ações de moderação.' });
    }

    const [session] = await sql`SELECT id FROM live_sessions WHERE id = ${id} LIMIT 1`;
    if (!session) return res.status(404).json({ error: 'Transmissão não encontrada.' });

    const [inserted] = await sql`
      INSERT INTO live_moderation_actions (live_session_id, participant_identity, action, reason, moderator_user_id)
      VALUES (${id}, ${participantIdentity}, ${action}, ${reason || null}, ${moderatorUserId})
      RETURNING *
    `;

    return res.status(201).json(inserted);
  } catch (error) {
    console.error('Erro ao registrar ação de moderação:', error);
    return res.status(500).json({ error: 'Erro interno ao registrar ação de moderação.' });
  }
}
