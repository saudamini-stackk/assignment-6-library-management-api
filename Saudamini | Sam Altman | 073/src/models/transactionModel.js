const { db } = require('../config/firebase');

const transactionsCollection = db.collection('transactions');

class TransactionModel {
  /**
   * Find transaction by ID
   */
  static async findById(id) {
    const doc = await transactionsCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Find active borrow transaction for a specific user and book
   */
  static async findActiveBorrow(userId, bookId) {
    const snapshot = await transactionsCollection
      .where('userId', '==', userId)
      .where('bookId', '==', bookId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Create a new borrow transaction
   */
  static async createBorrow({ userId, bookId, daysToDue = 14 }) {
    const now = new Date();
    const dueDate = new Date(now.getTime() + daysToDue * 24 * 60 * 60 * 1000);
    const docRef = transactionsCollection.doc();

    const transactionPayload = {
      transactionId: docRef.id,
      userId,
      bookId,
      type: 'borrow',
      borrowDate: now.toISOString(),
      returnDate: null,
      dueDate: dueDate.toISOString(),
      status: 'active',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await docRef.set(transactionPayload);
    return { id: docRef.id, ...transactionPayload };
  }

  /**
   * Mark transaction as returned
   */
  static async markReturned(id) {
    const docRef = transactionsCollection.doc(id);
    const now = new Date().toISOString();

    const updatePayload = {
      type: 'return',
      returnDate: now,
      status: 'returned',
      updatedAt: now,
    };

    await docRef.update(updatePayload);
    return this.findById(id);
  }

  /**
   * Get all transactions for a specific user
   */
  static async findByUserId(userId) {
    const snapshot = await transactionsCollection
      .where('userId', '==', userId)
      .get();

    const results = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Check overdue if still active
      if (data.status === 'active' && new Date(data.dueDate) < new Date()) {
        data.status = 'overdue';
      }
      results.push({ id: doc.id, ...data });
    });

    // Sort descending by borrowDate
    return results.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));
  }

  /**
   * Get all transactions with optional filters
   */
  static async getAll(filters = {}) {
    let query = transactionsCollection;

    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters.type) {
      query = query.where('type', '==', filters.type);
    }

    const snapshot = await query.get();
    const results = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'active' && new Date(data.dueDate) < new Date()) {
        data.status = 'overdue';
      }
      results.push({ id: doc.id, ...data });
    });

    // Sort descending by borrowDate
    return results.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));
  }
}

module.exports = TransactionModel;
