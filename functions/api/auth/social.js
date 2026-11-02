import { neon } from '@neondatabase/serverless';

export async function onRequestPost({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    'Content-Type': 'application/json',
  };

  try {
    const databaseUrl = env.DATABASE_URL;
    if (!databaseUrl) {
      return new Response(JSON.stringify({ error: 'DATABASE_URL não configurada no ambiente.' }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const sql = neon(databaseUrl);
    const body = await request.json();
    const { name, email: rawEmail, cpf, password, avatar, provider = 'google', providerId, socialHandle, socialLinks } = body;

    if (!name || !name.trim()) {
      return new Response(JSON.stringify({ error: 'Nome do usuário é obrigatório.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const cleanEmail = rawEmail && typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return new Response(JSON.stringify({ error: 'E-mail válido é obrigatório para cadastrar como membro.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }
    const email = cleanEmail;

    const userSocialLinks = {
      ...(socialLinks || {}),
      ...(socialHandle ? { [provider.toLowerCase()]: socialHandle } : {})
    };

    const existing = await sql`
      SELECT * FROM users 
      WHERE email = ${email} 
         OR (cpf IS NOT NULL AND cpf = ${cpf || ''})
         OR (provider_id = ${providerId || ''} AND auth_provider = ${provider})
      LIMIT 1
    `;

    if (existing && existing.length > 0) {
      const u = existing[0];

      const trimmedPass = (password || '').toString().trim();
      if (u.password_hash) {
        if (!trimmedPass) {
          return new Response(JSON.stringify({ error: 'Senha obrigatória. Digite a senha cadastrada para este e-mail.' }), {
            status: 401,
            headers: corsHeaders,
          });
        }
        if (trimmedPass !== u.password_hash) {
          return new Response(JSON.stringify({ error: 'Senha incorreta para este e-mail. Acesso negado.' }), {
            status: 401,
            headers: corsHeaders,
          });
        }
      } else {
        if (!trimmedPass || trimmedPass.length < 4) {
          return new Response(JSON.stringify({ error: 'Para sua segurança, defina uma senha de acesso (mínimo 4 caracteres) para entrar.' }), {
            status: 400,
            headers: corsHeaders,
          });
        }
        await sql`UPDATE users SET password_hash = ${trimmedPass} WHERE id = ${u.id}`;
      }

      return new Response(JSON.stringify({
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
      }), { status: 200, headers: corsHeaders });
    }

    const trimmedPass = (password || '').toString().trim();
    if (!trimmedPass || trimmedPass.length < 4) {
      return new Response(JSON.stringify({ error: 'Crie uma senha de acesso com no mínimo 4 caracteres para proteger sua conta.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

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
        id, name, username, email, cpf, password_hash, avatar, role, status, rank, 
        honor_points, auth_provider, provider_id, social_links, verified
      ) VALUES (
        ${id}, ${name}, ${username}, ${email}, ${cpf || null}, ${trimmedPass}, ${avatarUrl}, 'user', 'active', 'soldado',
        100, ${provider}, ${providerId || id}, ${JSON.stringify(userSocialLinks)}::jsonb, false
      )
      RETURNING *
    `;

    const u = inserted[0];
    return new Response(JSON.stringify({
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
    }), { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Erro no login social Neon:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno no servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    },
  });
}
