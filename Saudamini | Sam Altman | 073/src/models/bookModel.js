const { db } = require('../config/firebase');

const booksCollection = db.collection('books');

class BookModel {
  /**
   * Find book by document ID
   */
  static async findById(id) {
    const doc = await booksCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Find book by ISBN
   */
  static async findByIsbn(isbn) {
    const snapshot = await booksCollection.where('isbn', '==', isbn.trim()).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Create a new book
   */
  static async create(bookData) {
    const now = new Date().toISOString();
    const docRef = booksCollection.doc();
    const quantity = parseInt(bookData.quantity, 10) || 0;
    const status = quantity > 0 ? 'available' : 'borrowed';

    const bookPayload = {
      bookId: docRef.id,
      title: bookData.title.trim(),
      author: bookData.author.trim(),
      isbn: bookData.isbn.trim(),
      category: bookData.category.trim(),
      status: bookData.status || status,
      quantity,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(bookPayload);
    return { id: docRef.id, ...bookPayload };
  }

  /**
   * Get all books with optional filters
   */
  static async getAll(filters = {}) {
    let query = booksCollection;

    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters.author) {
      query = query.where('author', '==', filters.author);
    }

    const snapshot = await query.get();
    const books = [];
    snapshot.forEach((doc) => {
      books.push({ id: doc.id, ...doc.data() });
    });

    return books;
  }

  /**
   * Search books by title or author (case-insensitive substring match)
   */
  static async search(term) {
    const searchTerm = term.toLowerCase().trim();
    const snapshot = await booksCollection.get();
    const results = [];

    snapshot.forEach((doc) => {
      const book = { id: doc.id, ...doc.data() };
      const title = (book.title || '').toLowerCase();
      const author = (book.author || '').toLowerCase();
      const category = (book.category || '').toLowerCase();
      const isbn = (book.isbn || '').toLowerCase();

      if (
        title.includes(searchTerm) ||
        author.includes(searchTerm) ||
        category.includes(searchTerm) ||
        isbn.includes(searchTerm)
      ) {
        results.push(book);
      }
    });

    return results;
  }

  /**
   * Update book details
   */
  static async update(id, updateData) {
    const docRef = booksCollection.doc(id);
    const existing = await this.findById(id);
    if (!existing) return null;

    const payload = { ...updateData, updatedAt: new Date().toISOString() };

    if (payload.quantity !== undefined) {
      payload.quantity = parseInt(payload.quantity, 10);
      if (!payload.status) {
        payload.status = payload.quantity > 0 ? 'available' : 'borrowed';
      }
    }

    await docRef.update(payload);
    return this.findById(id);
  }

  /**
   * Delete book
   */
  static async delete(id) {
    await booksCollection.doc(id).delete();
    return true;
  }
}

module.exports = BookModel;
