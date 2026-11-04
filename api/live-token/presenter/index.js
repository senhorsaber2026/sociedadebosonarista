import { neon } from '@neondatabase/serverless';
import { AccessToken } from 'livekit-server-sdk';

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
  const livekitUrl = process.env.LIVEKIT_URL;
  const livekitApiKey = process.env.LIVEKIT_API_KEY;
  const livekitApiSecret = process.env.LIVEKIT_API_SECRET;

  if (!databaseUrl || !livekitUrl || !livekitApiKey || !livekitApiSecret) {
    return res.status(500).json({ error: 'Configuração do servidor incompleta.' });
  }

  const sql = neon(databaseUrl);

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { roomName, userId } = body;

    if (!roomName || !userId) {
      return res.status(400).json({ error: 'Sala e usuário são obrigatórios.' });
    }

    // Verifica se o usuário existe e é admin ou moderador
    const [user] = await sql`SELECT id, role FROM users WHERE id = ${userId} LIMIT 1`;
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    if (user.role !== 'admin' && user.role !== 'moderator') {
      return res.status(403).json({ error: 'Apenas administradores e moderadores podem obter token de apresentador.' });
    }

    // Verifica se a transmissão existe e está autorizada
    const [session] = await sql`SELECT * FROM live_sessions WHERE room_name = ${roomName} LIMIT 1`;
    if (!session) return res.status(404).json({ error: 'Transmissão não encontrada.' });
    if (session.status !== 'scheduled' && session.status !== 'live') {
      return res.status(400).json({ error: 'Transmissão não está autorizada para início.' });
    }

    const identity = `presenter_${userId}`;

    const token = new AccessToken(livekitApiKey, livekitApiSecret, { identity, ttl: '2h' });
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
      canPublishVideo: true,
      canPublishAudio: true,
    });

    const jwt = await token.toJwt();

    return res.status(200).json({
      token: jwt,
      url: livekitUrl,
      roomName,
      identity,
    });
  } catch (error) {
    console.error('Erro ao gerar token de apresentador:', error);
    return res.status(500).json({ error: 'Erro interno ao gerar token de apresentador.' });
  }
}
