require('dotenv').config();
const bcrypt = require('bcrypt');
const { db } = require('./src/config/firebase');

async function seedDatabase() {
  console.log('🌱 Starting Library Management Database Seeding...');

  try {
    const saltRounds = 10;
    const now = new Date().toISOString();

    // 1. Seed Users
    console.log('👤 Seeding default users...');
    const users = [
      {
        email: 'admin@library.com',
        name: 'Admin Librarian',
        password: await bcrypt.hash('Admin@123', saltRounds),
        role: 'librarian',
        createdAt: now,
        updatedAt: now,
      },
      {
        email: 'student@library.com',
        name: 'Raj Rasal',
        password: await bcrypt.hash('Student@123', saltRounds),
        role: 'student',
        createdAt: now,
        updatedAt: now,
      },
      {
        email: 'jane@library.com',
        name: 'Jane Doe',
        password: await bcrypt.hash('Student@123', saltRounds),
        role: 'student',
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const u of users) {
      const existing = await db.collection('users').where('email', '==', u.email).limit(1).get();
      if (existing.empty) {
        const docRef = db.collection('users').doc();
        await docRef.set({ userId: docRef.id, ...u });
        console.log(` Created user: ${u.email} (${u.role})`);
      } else {
        console.log(` User ${u.email} already exists.`);
      }
    }

    // 2. Seed Books
    console.log('\n📚 Seeding sample books...');
    const books = [
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        isbn: '978-0132350884',
        category: 'Software Engineering',
        quantity: 5,
        status: 'available',
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'David Thomas, Andrew Hunt',
        isbn: '978-0135957059',
        category: 'Software Engineering',
        quantity: 3,
        status: 'available',
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'JavaScript: The Good Parts',
        author: 'Douglas Crockford',
        isbn: '978-0596517748',
        category: 'Web Development',
        quantity: 4,
        status: 'available',
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen',
        isbn: '978-0262033848',
        category: 'Computer Science',
        quantity: 2,
        status: 'available',
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        isbn: '978-0062316097',
        category: 'History',
        quantity: 4,
        status: 'available',
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '978-0061120084',
        category: 'Classic Fiction',
        quantity: 3,
        status: 'available',
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const b of books) {
      const existing = await db.collection('books').where('isbn', '==', b.isbn).limit(1).get();
      if (existing.empty) {
        const docRef = db.collection('books').doc();
        await docRef.set({ bookId: docRef.id, ...b });
        console.log(` Created book: "${b.title}" (Qty: ${b.quantity})`);
      } else {
        console.log(` Book with ISBN ${b.isbn} already exists.`);
      }
    }

    console.log('\n Database seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
