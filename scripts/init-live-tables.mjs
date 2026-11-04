import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('ERRO: DATABASE_URL não definida em .env.local');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function main() {
  console.log('Testando conexão com o Neon...');

  await sql`SELECT NOW() as current_time`;
  console.log('Conexão estabelecida com sucesso!');

  console.log('Criando tabela live_sessions...');
  await sql`
    CREATE TABLE IF NOT EXISTS live_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(200) NOT NULL,
      description TEXT,
      cover_image TEXT,
      category VARCHAR(100),
      room_name VARCHAR(120) UNIQUE NOT NULL,
      host_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
      started_at TIMESTAMPTZ,
      ended_at TIMESTAMPTZ,
      viewer_count INTEGER DEFAULT 0,
      peak_viewers INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  console.log('Criando tabela live_chat_messages...');
  await sql`
    CREATE TABLE IF NOT EXISTS live_chat_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      live_session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
      sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      visitor_id VARCHAR(100),
      display_name VARCHAR(80) NOT NULL,
      message VARCHAR(500) NOT NULL,
      message_type VARCHAR(20) DEFAULT 'user',
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  console.log('Criando tabela live_viewer_presence...');
  await sql`
    CREATE TABLE IF NOT EXISTS live_viewer_presence (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      live_session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
      participant_identity VARCHAR(120) NOT NULL,
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ DEFAULT NOW(),
      left_at TIMESTAMPTZ,
      UNIQUE(live_session_id, participant_identity)
    );
  `;

  console.log('Criando tabela live_chat_reports...');
  await sql`
    CREATE TABLE IF NOT EXISTS live_chat_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      live_session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
      message_id UUID NOT NULL REFERENCES live_chat_messages(id) ON DELETE CASCADE,
      reporter_identity VARCHAR(120) NOT NULL,
      reason VARCHAR(100) NOT NULL,
      details TEXT,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      reviewed_at TIMESTAMPTZ,
      reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL
    );
  `;

  console.log('Criando tabela live_moderation_actions...');
  await sql`
    CREATE TABLE IF NOT EXISTS live_moderation_actions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      live_session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
      participant_identity VARCHAR(120) NOT NULL,
      action VARCHAR(30) NOT NULL,
      reason TEXT,
      moderator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  console.log('Criando índices...');
  await sql`CREATE INDEX IF NOT EXISTS idx_live_sessions_status ON live_sessions(status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_live_sessions_host ON live_sessions(host_user_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_live_sessions_room ON live_sessions(room_name);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_live_chat_messages_session ON live_chat_messages(live_session_id, created_at);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_live_chat_messages_deleted ON live_chat_messages(is_deleted);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_live_viewer_presence_session ON live_viewer_presence(live_session_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_live_chat_reports_session ON live_chat_reports(live_session_id, status);`;

  console.log('Verificando colunas de auditoria...');
  try {
    await sql`
      ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    `;
    await sql`
      ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    `;
  } catch (e) {
    console.warn('Aviso ao ajustar colunas de timestamp:', e.message);
  }

  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  console.log('Tabelas existentes no banco público:', tables.map(t => t.table_name));

  console.log('Migração de tabelas de transmissão ao vivo concluída com sucesso!');
}

main().catch((err) => {
  console.error('Erro ao executar migração:', err);
  process.exit(1);
});
