import { neon } from '@neondatabase/serverless';

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
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
      const { status, category, limit = '50', offset = '0' } = req.query;
      let query = `
        SELECT ls.*, u.name as host_user_name, u.avatar as host_user_avatar
        FROM live_sessions ls
        LEFT JOIN users u ON u.id = ls.host_user_id
        WHERE 1=1
      `;
      const params = [];
      if (status) { query += ` AND ls.status = $${params.push(status)}`; }
      if (category) { query += ` AND ls.category = $${params.push(category)}`; }
      query += ` ORDER BY ls.created_at DESC LIMIT $${params.push(parseInt(limit))} OFFSET $${params.push(parseInt(offset))}`;
      const sessions = await sql(query, params);
      return res.status(200).json(sessions);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { title, description, coverImage, category, roomName, hostUserId } = body;

      if (!title || !title.trim()) return res.status(400).json({ error: 'Título é obrigatório.' });
      if (!hostUserId) return res.status(400).json({ error: 'Usuário host é obrigatório.' });

      const finalRoomName = roomName || `live_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      // Verifica se o usuário existe e seu papel
      const userCheck = await sql`SELECT id, role FROM users WHERE id = ${hostUserId} LIMIT 1`;
      if (userCheck.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
      const userRole = userCheck[0].role;

      if (userRole !== 'admin' && userRole !== 'moderator') {
        return res.status(403).json({ error: 'Apenas administradores e moderadores podem criar transmissões.' });
      }

      const existing = await sql`SELECT id FROM live_sessions WHERE room_name = ${finalRoomName} LIMIT 1`;
      if (existing.length > 0) return res.status(409).json({ error: 'Nome da sala já existe. Escolha outro.' });

      const [created] = await sql`
        INSERT INTO live_sessions (title, description, cover_image, category, room_name, host_user_id, status, viewer_count, peak_viewers)
        VALUES (${title.trim()}, ${description || null}, ${coverImage || null}, ${category || null}, ${finalRoomName}, ${hostUserId}, 'scheduled', 0, 0)
        RETURNING *
      `;

      return res.status(201).json(created);
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error('Erro na API live-sessions:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
