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
    const actions = await sql`
      SELECT lma.*, u.name as moderator_name
      FROM live_moderation_actions lma
      LEFT JOIN users u ON u.id = lma.moderator_user_id
      ORDER BY lma.created_at DESC
      LIMIT 100
    `;
    return res.status(200).json(actions);
  } catch (error) {
    console.error('Erro ao buscar ações de moderação:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar ações de moderação.' });
  }
}
