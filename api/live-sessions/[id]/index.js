import { neon } from '@neondatabase/serverless';

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
};

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(200).end();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return res.status(500).json({ error: 'DATABASE_URL não configurada.' });
  const sql = neon(databaseUrl);

  const { id } = req.query || {};

  if (!id) return res.status(400).json({ error: 'ID da transmissão é obrigatório.' });

  try {
    if (req.method === 'GET') {
      const [session] = await sql`
        SELECT ls.*, u.name as host_user_name, u.avatar as host_user_avatar
        FROM live_sessions ls
        LEFT JOIN users u ON u.id = ls.host_user_id
        WHERE ls.id = ${id}
        LIMIT 1
      `;
      if (!session) return res.status(404).json({ error: 'Transmissão não encontrada.' });
      return res.status(200).json(session);
    }

    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { title, description, coverImage, category, status, userId } = body;

      const [session] = await sql`SELECT * FROM live_sessions WHERE id = ${id} LIMIT 1`;
      if (!session) return res.status(404).json({ error: 'Transmissão não encontrada.' });

      if (session.host_user_id !== userId) {
        const userCheck = await sql`SELECT role FROM users WHERE id = ${userId} LIMIT 1`;
        if (userCheck.length === 0 || (userCheck[0].role !== 'admin' && userCheck[0].role !== 'moderator')) {
          return res.status(403).json({ error: 'Sem permissão para editar esta transmissão.' });
        }
      }

      const [updated] = await sql`
        UPDATE live_sessions
        SET title = COALESCE(${title || null}, title),
            description = COALESCE(${description || null}, description),
            cover_image = COALESCE(${coverImage || null}, cover_image),
            category = COALESCE(${category || null}, category),
            status = COALESCE(${status || null}, status),
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { userId } = body;

      const [session] = await sql`SELECT * FROM live_sessions WHERE id = ${id} LIMIT 1`;
      if (!session) return res.status(404).json({ error: 'Transmissão não encontrada.' });

      if (session.host_user_id !== userId) {
        const userCheck = await sql`SELECT role FROM users WHERE id = ${userId} LIMIT 1`;
        if (userCheck.length === 0 || (userCheck[0].role !== 'admin' && userCheck[0].role !== 'moderator')) {
          return res.status(403).json({ error: 'Sem permissão para excluir esta transmissão.' });
        }
      }

      await sql`DELETE FROM live_sessions WHERE id = ${id}`;
      return res.status(200).json({ success: true, message: 'Transmissão excluída.' });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error('Erro na API live-sessions/[id]:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
