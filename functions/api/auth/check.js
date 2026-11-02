import { neon } from '@neondatabase/serverless';

export async function onRequest({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const databaseUrl = env.DATABASE_URL;
    if (!databaseUrl) {
      return new Response(JSON.stringify({ error: 'DATABASE_URL não configurada no ambiente.' }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const sql = neon(databaseUrl);
    let identifier = '';

    if (request.method === 'GET') {
      const url = new URL(request.url);
      identifier = url.searchParams.get('email') || url.searchParams.get('identifier') || '';
    } else {
      const body = await request.json();
      identifier = (body.email || body.identifier || '').toString();
    }

    const clean = identifier.trim().toLowerCase();
    if (!clean) {
      return new Response(JSON.stringify({ error: 'E-mail ou identificador é obrigatório' }), {
        status: 400,
        headers: corsHeaders,
      });
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
      return new Response(JSON.stringify({
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
      }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ registered: false }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (err) {
    console.error('Erro na verificação de membro Neon:', err);
    return new Response(JSON.stringify({ error: err.message || 'Erro interno no servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
