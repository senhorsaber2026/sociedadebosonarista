import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { neon } from '@neondatabase/serverless';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const databaseUrl = env.DATABASE_URL || process.env.DATABASE_URL;

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'neon-api-dev-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/auth/social') && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                res.setHeader('Content-Type', 'application/json');
                try {
                  if (!databaseUrl) {
                    res.statusCode = 500;
                    return res.end(JSON.stringify({ error: 'DATABASE_URL não encontrada' }));
                  }
                  const sql = neon(databaseUrl);
                  const parsed = JSON.parse(body || '{}');
                  const { name, email: rawEmail, cpf, password, avatar, provider = 'google', providerId, socialHandle, socialLinks } = parsed;

                  if (!name || !name.trim()) {
                    res.statusCode = 400;
                    return res.end(JSON.stringify({ error: 'Nome do usuário é obrigatório' }));
                  }

                  const cleanEmail = rawEmail && typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
                  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
                    res.statusCode = 400;
                    return res.end(JSON.stringify({ error: 'E-mail válido é obrigatório para cadastrar como membro.' }));
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
                        res.statusCode = 401;
                        return res.end(JSON.stringify({ error: 'Senha obrigatória. Digite a senha cadastrada para este e-mail.' }));
                      }
                      if (trimmedPass !== u.password_hash) {
                        res.statusCode = 401;
                        return res.end(JSON.stringify({ error: 'Senha incorreta para este e-mail. Acesso negado.' }));
                      }
                    } else {
                      if (!trimmedPass || trimmedPass.length < 4) {
                        res.statusCode = 400;
                        return res.end(JSON.stringify({ error: 'Para sua segurança, defina uma senha de acesso (mínimo 4 caracteres) para entrar.' }));
                      }
                      await sql`UPDATE users SET password_hash = ${trimmedPass} WHERE id = ${u.id}`;
                    }

                    res.statusCode = 200;
                    return res.end(JSON.stringify({
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
                    }));
                  }

                  // Novo cadastro: senha obrigatória
                  const trimmedPass = (password || '').toString().trim();
                  if (!trimmedPass || trimmedPass.length < 4) {
                    res.statusCode = 400;
                    return res.end(JSON.stringify({ error: 'Crie uma senha de acesso com no mínimo 4 caracteres para proteger sua conta.' }));
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
                  res.statusCode = 200;
                  return res.end(JSON.stringify({
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
                  }));
                } catch (err: any) {
                  res.statusCode = 500;
                  return res.end(JSON.stringify({ error: err?.message || 'Erro no servidor' }));
                }
              });
              return;
            }

            if (req.url?.startsWith('/api/auth/check')) {
              const urlObj = new URL(req.url, 'http://localhost');
              const emailParam = urlObj.searchParams.get('email') || urlObj.searchParams.get('identifier') || '';

              const handleCheck = async (identifier: string) => {
                res.setHeader('Content-Type', 'application/json');
                try {
                  if (!databaseUrl) {
                    res.statusCode = 500;
                    return res.end(JSON.stringify({ error: 'DATABASE_URL não configurada' }));
                  }
                  const sql = neon(databaseUrl);
                  const clean = identifier.trim().toLowerCase();
                  if (!clean) {
                    res.statusCode = 400;
                    return res.end(JSON.stringify({ error: 'Identificador obrigatório' }));
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
                    res.statusCode = 200;
                    return res.end(JSON.stringify({
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
                    }));
                  }
                  res.statusCode = 200;
                  return res.end(JSON.stringify({ registered: false }));
                } catch (err: any) {
                  res.statusCode = 500;
                  return res.end(JSON.stringify({ error: err.message || 'Erro no servidor' }));
                }
              };

              if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                  try {
                    const parsed = JSON.parse(body || '{}');
                    handleCheck(parsed.email || parsed.identifier || '');
                  } catch {
                    handleCheck('');
                  }
                });
                return;
              } else {
                handleCheck(emailParam);
                return;
              }
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
