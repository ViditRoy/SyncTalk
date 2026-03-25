import { db } from '../lib/db/index.js';

async function checkUsers() {
  try {
    const users = await db.users.findMany();
    console.log('Users in database:', users.length);
    users.forEach(u => console.log(`  ${u.id}: ${u.username} (${u.email})`));
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();