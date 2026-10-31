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
                  const { name, email: rawEmail, avatar, provider = 'google', providerId, socialHandle, socialLinks } = parsed;

                  if (!name) {
                    res.statusCode = 400;
                    return res.end(JSON.stringify({ error: 'Nome do usuário é obrigatório' }));
                  }

                  const cleanHandle = (socialHandle || name).toLowerCase().replace(/[^a-z0-9]/g, '');
                  const email = rawEmail && rawEmail.includes('@') 
                    ? rawEmail.trim().toLowerCase() 
                    : `${cleanHandle || 'patriota'}_${Math.floor(1000 + Math.random() * 9000)}@${provider.toLowerCase()}.social`;

                  const userSocialLinks = {
                    ...(socialLinks || {}),
                    ...(socialHandle ? { [provider.toLowerCase()]: socialHandle } : {})
                  };

                  const existing = await sql`
                    SELECT * FROM users 
                    WHERE email = ${email} OR (provider_id = ${providerId || ''} AND auth_provider = ${provider})
                    LIMIT 1
                  `;

                  if (existing && existing.length > 0) {
                    const u = existing[0];
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
                } catch (err) {
                  res.statusCode = 500;
                  return res.end(JSON.stringify({ error: err.message || 'Erro no servidor' }));
                }
              });
              return;
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
