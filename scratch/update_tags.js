const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_YkPav4DMmZK3@ep-jolly-poetry-atlftnvm-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  const tags = JSON.stringify(['mecha', 'sword', 'demon', 'dark', 'chibi', 'red']);
  const vibes = JSON.stringify(['focused']);
  
  await sql`
    UPDATE "submitted_pets"
    SET tags = ${tags}::jsonb, vibes = ${vibes}::jsonb
    WHERE slug = 'mecha-darkin'
  `;
  console.log("Updated Sword Demon!");
}

main().catch(console.error);
