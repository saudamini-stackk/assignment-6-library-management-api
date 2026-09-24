const { db, FieldValue } = require('../config/firebase');

const usersCollection = db.collection('users');

class UserModel {
  /**
   * Find user by document ID / userId
   */
  static async findById(id) {
    const doc = await usersCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const snapshot = await usersCollection.where('email', '==', email.toLowerCase()).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Create a new user
   */
  static async create(userData) {
    const now = new Date().toISOString();
    const docRef = usersCollection.doc();
    const userPayload = {
      userId: docRef.id,
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password,
      role: userData.role || 'student',
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(userPayload);
    return { id: docRef.id, ...userPayload };
  }

  /**
   * Update user details
   */
  static async update(id, updateData) {
    const docRef = usersCollection.doc(id);
    const updatePayload = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    await docRef.update(updatePayload);
    return this.findById(id);
  }

  /**
   * Update user role
   */
  static async updateRole(id, role) {
    return this.update(id, { role });
  }

  /**
   * Delete user
   */
  static async delete(id) {
    await usersCollection.doc(id).delete();
    return true;
  }

  /**
   * Get all users (returns list without passwords)
   */
  static async getAll() {
    const snapshot = await usersCollection.get();
    const users = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      delete data.password;
      users.push({ id: doc.id, ...data });
    });
    return users;
  }
}

module.exports = UserModel;
