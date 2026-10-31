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
  
  const now = await sql`SELECT NOW() as current_time, version() as pg_version`;
  console.log('Conexão estabelecida com sucesso!');
  console.log('Horário do Banco:', now[0].current_time);
  console.log('Versão:', now[0].pg_version);

  console.log('Criando tabela de usuários...');
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      cpf VARCHAR(20),
      password_hash TEXT,
      avatar TEXT,
      cover_image TEXT,
      bio TEXT,
      location VARCHAR(255),
      birth_date VARCHAR(50),
      role VARCHAR(50) DEFAULT 'user',
      status VARCHAR(50) DEFAULT 'active',
      rank VARCHAR(50) DEFAULT 'soldado',
      honor_points INTEGER DEFAULT 0,
      auth_provider VARCHAR(50) DEFAULT 'local',
      provider_id VARCHAR(255),
      social_links JSONB DEFAULT '{}'::jsonb,
      verified BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  console.log('Tabela "users" criada ou já existente com sucesso!');
  
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `;
  console.log('Tabelas existentes no banco público:', tables.map(t => t.table_name));
}

main().catch((err) => {
  console.error('Erro ao conectar ou criar tabelas:', err);
  process.exit(1);
});
