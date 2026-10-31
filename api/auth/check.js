import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.status(500).json({ error: 'DATABASE_URL não configurada no ambiente.' });
    }

    const sql = neon(databaseUrl);
    let identifier = '';

    if (req.method === 'GET') {
      identifier = (req.query?.email || req.query?.identifier || '').toString();
    } else {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      identifier = (body.email || body.identifier || '').toString();
    }

    const clean = identifier.trim().toLowerCase();
    if (!clean) {
      return res.status(400).json({ error: 'E-mail ou identificador é obrigatório' });
    }

    const existing = await sql`
      SELECT id, name, username, email, cpf, avatar, bio, role, status, rank, honor_points, auth_provider, verified, created_at
      FROM users 
      WHERE LOWER(email) = ${clean}
         OR LOWER(username) = ${clean.replace('@', '')}
      LIMIT 1
    `;

    if (existing && existing.length > 0) {
      const u = existing[0];
      return res.status(200).json({
        registered: true,
        user: {
          id: u.id,
          name: u.name,
          username: u.username,
          email: u.email,
          cpf: u.cpf,
          avatar: u.avatar,
          bio: u.bio || '',
          role: u.role || 'user',
          status: u.status || 'active',
          rank: u.rank || 'soldado',
          honorPoints: Number(u.honor_points) || 50,
          authProvider: u.auth_provider,
          createdAt: u.created_at,
          verified: !!u.verified
        }
      });
    }

    return res.status(200).json({ registered: false });
  } catch (err) {
    console.error('Erro na verificação de membro Neon:', err);
    return res.status(500).json({ error: err.message || 'Erro interno no servidor' });
  }
}
