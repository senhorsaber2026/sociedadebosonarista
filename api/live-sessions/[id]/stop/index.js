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
    const { userId } = body;

    if (!userId) return res.status(400).json({ error: 'Usuário é obrigatório.' });

    const [session] = await sql`
      UPDATE live_sessions
      SET status = 'ended', ended_at = NOW(), updated_at = NOW()
      WHERE id = ${req.query.id} AND host_user_id = ${userId} AND status = 'live'
      RETURNING *
    `;

    if (!session) return res.status(404).json({ error: 'Transmissão ao vivo não encontrada ou não está ativa.' });

    return res.status(200).json(session);
  } catch (error) {
    console.error('Erro ao encerrar transmissão:', error);
    return res.status(500).json({ error: 'Erro interno ao encerrar transmissão.' });
  }
}
