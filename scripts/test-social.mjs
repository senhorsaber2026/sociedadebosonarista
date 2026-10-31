import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function test() {
  const result = await sql`
    SELECT count(*)::int as total FROM users;
  `;
  console.log('Total de usuários cadastrados no Neon:', result[0].total);
}

test().catch(console.error);
