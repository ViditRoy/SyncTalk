import { db } from '../lib/db/index.js';
import { mockPresence } from '../lib/store.js';

async function checkPresence() {
  try {
    console.log('Checking users in database...');
    const users = await db.users.findMany();
    console.log(`Found ${users.length} users in database:`);
    users.forEach(u => console.log(`  ${u.username} (${u.email})`));

    console.log('\nMock presence data:');
    mockPresence.forEach(p => {
      console.log(`  ${p.username}: ${p.status}`);
    });

    // Check for uniqueness violations
    const emails = users.map(u => u.email.toLowerCase());
    const uniqueEmails = new Set(emails);
    const usernames = users.map(u => u.username.toLowerCase());
    const uniqueUsernames = new Set(usernames);

    console.log('\nUniqueness check:');
    console.log(`  Total users: ${users.length}`);
    console.log(`  Unique emails: ${uniqueEmails.size}`);
    console.log(`  Unique usernames: ${uniqueUsernames.size}`);

    if (emails.length !== uniqueEmails.size) {
      console.log('  ⚠️  DUPLICATE EMAILS FOUND!');
      const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
      console.log('  Duplicate emails:', [...new Set(duplicates)]);
    } else {
      console.log('  ✅ All emails are unique');
    }

    if (usernames.length !== uniqueUsernames.size) {
      console.log('  ⚠️  DUPLICATE USERNAMES FOUND!');
      const duplicates = usernames.filter((username, index) => usernames.indexOf(username) !== index);
      console.log('  Duplicate usernames:', [...new Set(duplicates)]);
    } else {
      console.log('  ✅ All usernames are unique');
    }

  } catch (error) {
    console.error('Error checking presence:', error);
  }
}

checkPresence();