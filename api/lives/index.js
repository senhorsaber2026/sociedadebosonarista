import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return res.status(500).json({ error: 'DATABASE_URL não configurada.' });
  const sql = neon(databaseUrl);

  try {
    if (req.method === 'GET') {
      const lives = await sql`SELECT * FROM lives WHERE is_active = TRUE ORDER BY started_at DESC`;
      return res.status(200).json(lives);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { userId, userName, userAvatar, title, description } = body;

      // Desativa outras lives do mesmo usuário
      await sql`UPDATE lives SET is_active = FALSE WHERE user_id = ${userId} AND is_active = TRUE`;

      const id = `live_${Date.now()}`;
      await sql`
        INSERT INTO lives (id, user_id, user_name, user_avatar, title, description, is_active)
        VALUES (${id}, ${userId}, ${userName}, ${userAvatar || ''}, ${title}, ${description || ''}, TRUE)
      `;
      
      return res.status(201).json({ id, userId, title, is_active: true });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API de lives:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
