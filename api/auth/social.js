import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Configuração de CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.status(500).json({ error: 'DATABASE_URL não configurada no ambiente.' });
    }

    const sql = neon(databaseUrl);
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { name, email: rawEmail, avatar, provider = 'google', providerId, socialHandle, socialLinks } = body;

    if (!name) {
      return res.status(400).json({ error: 'Nome do usuário é obrigatório.' });
    }

    // Gerar e-mail padrão caso entre com rede social que use apenas @usuario ou telefone
    const cleanHandle = (socialHandle || name).toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = rawEmail && rawEmail.includes('@') 
      ? rawEmail.trim().toLowerCase() 
      : `${cleanHandle || 'patriota'}_${Math.floor(1000 + Math.random() * 9000)}@${provider.toLowerCase()}.social`;

    // Montar objeto de links sociais
    const userSocialLinks = {
      ...(socialLinks || {}),
      ...(socialHandle ? { [provider.toLowerCase()]: socialHandle } : {})
    };

    // Verificar se o usuário já existe por email ou provider_id
    const existing = await sql`
      SELECT * FROM users 
      WHERE email = ${email} OR (provider_id = ${providerId || ''} AND auth_provider = ${provider})
      LIMIT 1
    `;

    if (existing && existing.length > 0) {
      const u = existing[0];
      return res.status(200).json({
        success: true,
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
          createdAt: u.created_at,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          socialLinks: u.social_links || userSocialLinks,
          verified: !!u.verified
        }
      });
    }

    // Gerar novo ID e username amigável
    const id = 'usr_' + Math.random().toString(36).substring(2, 10);
    const baseUsername = (socialHandle || name || 'patriota')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 14);
    const username = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
    const avatarUrl = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

    const inserted = await sql`
      INSERT INTO users (
        id, name, username, email, avatar, role, status, rank, 
        honor_points, auth_provider, provider_id, social_links, verified
      ) VALUES (
        ${id}, ${name}, ${username}, ${email}, ${avatarUrl}, 'user', 'active', 'soldado',
        100, ${provider}, ${providerId || id}, ${JSON.stringify(userSocialLinks)}::jsonb, false
      )
      RETURNING *
    `;

    const u = inserted[0];
    return res.status(200).json({
      success: true,
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
        honorPoints: Number(u.honor_points) || 100,
        createdAt: u.created_at,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        socialLinks: {},
        verified: false
      }
    });
  } catch (error) {
    console.error('Erro no login social Neon:', error);
    return res.status(500).json({ error: error.message || 'Erro interno no servidor' });
  }
}
