import { neon } from '@neondatabase/serverless';
import { AccessToken } from 'livekit-server-sdk';
import { randomBytes } from 'crypto';

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
    const { roomName } = body;

    if (!roomName) {
      return res.status(400).json({ error: 'Sala é obrigatória.' });
    }

    // Verifica se a transmissão existe e está ao vivo
    const [session] = await sql`SELECT * FROM live_sessions WHERE room_name = ${roomName} LIMIT 1`;
    if (!session) return res.status(404).json({ error: 'Transmissão não encontrada.' });
    if (session.status !== 'live') {
      return res.status(400).json({ error: 'Transmissão não está ao vivo no momento.' });
    }

    // Identidade temporária e não identificável para o visitante
    const visitorId = `visitor_${randomBytes(8).toString('hex')}`;

    const token = new AccessToken(livekitApiKey, livekitApiSecret, { identity: visitorId, ttl: '4h' });
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: false,
      canPublishData: false,
      canSubscribe: true,
      canPublishVideo: false,
      canPublishAudio: false,
    });

    const jwt = await token.toJwt();

    return res.status(200).json({
      token: jwt,
      url: livekitUrl,
      roomName,
      identity: visitorId,
      visitorId,
    });
  } catch (error) {
    console.error('Erro ao gerar token de espectador:', error);
    return res.status(500).json({ error: 'Erro interno ao gerar token de espectador.' });
  }
}
