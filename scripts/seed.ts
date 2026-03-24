import { db } from '../lib/db';
import { hashPassword } from '../lib/auth';

async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Create demo users
    const demoUsers = [
      {
        id: '1',
        username: 'alice',
        email: 'alice@example.com',
        password: 'Password1!',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        username: 'bob',
        email: 'bob@example.com',
        password: 'Password2!',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        username: 'charlie',
        email: 'charlie@example.com',
        password: 'Password3!',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    for (const user of demoUsers) {
      const passwordHash = await hashPassword(user.password);
      await db.users.create({
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          passwordHash,
          createdAt: user.createdAt,
        },
      });
    }

    // Create demo conversations
    const conversations = [
      {
        id: 'conv-1',
        name: 'General',
        description: 'General discussion channel',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        members: ['1', '2', '3'],
        isDirect: false,
      },
      {
        id: 'conv-2',
        name: 'Development',
        description: 'Development discussions',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        members: ['1', '2'],
        isDirect: false,
      },
      {
        id: 'conv-3',
        name: 'Random',
        description: 'Random discussions',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        members: ['1', '3'],
        isDirect: false,
      },
    ];

    for (const conv of conversations) {
      await db.conversations.create({
        data: {
          id: conv.id,
          name: conv.name,
          description: conv.description,
          createdAt: conv.createdAt,
          members: conv.members,
          isDirect: conv.isDirect,
        },
      });
    }

    // Create demo messages
    const messages = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: '1',
        senderUsername: 'alice',
        content: 'Welcome to SyncTalk!',
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'read',
        readBy: ['1', '2', '3'],
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: '2',
        senderUsername: 'bob',
        content: 'Thanks! This looks great.',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'read',
        readBy: ['1', '2', '3'],
      },
    ];

    for (const msg of messages) {
      await db.messages.create({
        data: {
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          senderUsername: msg.senderUsername,
          content: msg.content,
          createdAt: msg.createdAt,
          status: msg.status,
          readBy: msg.readBy,
        },
      });
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();