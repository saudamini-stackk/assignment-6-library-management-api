const BookModel = require('../models/bookModel');
const TransactionModel = require('../models/transactionModel');

/**
 * Get all books (with optional filters: category, status, author)
 * GET /api/books
 */
const getAllBooks = async (req, res, next) => {
  try {
    const { category, status, author } = req.query;
    const filters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (author) filters.author = author;

    const books = await BookModel.getAll(filters);
    return res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search books by title or author
 * GET /api/books/search?q=...
 */
const searchBooks = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required for search.',
      });
    }

    const books = await BookModel.search(q);
    return res.status(200).json({
      success: true,
      query: q,
      count: books.length,
      books,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single book details
 * GET /api/books/:id
 */
const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await BookModel.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add new book (Librarian only)
 * POST /api/books
 */
const createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, category, quantity, status } = req.body;

    // Check if ISBN already exists
    const existingBook = await BookModel.findByIsbn(isbn);
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: `A book with ISBN '${isbn}' already exists.`,
      });
    }

    const newBook = await BookModel.create({
      title,
      author,
      isbn,
      category,
      quantity,
      status,
    });

    return res.status(201).json({
      success: true,
      message: 'Book created successfully.',
      book: newBook,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update book (Librarian only)
 * PUT /api/books/:id
 */
const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingBook = await BookModel.findById(id);

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: `Book with ID '${id}' not found.`,
      });
    }

    // Check ISBN conflict if changing ISBN
    if (req.body.isbn && req.body.isbn !== existingBook.isbn) {
      const isbnConflict = await BookModel.findByIsbn(req.body.isbn);
      if (isbnConflict && isbnConflict.id !== id) {
        return res.status(400).json({
          success: false,
          message: `Another book with ISBN '${req.body.isbn}' already exists.`,
        });
      }
    }

    const updatedBook = await BookModel.update(id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Book updated successfully.',
      book: updatedBook,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete book (Librarian only)
 * DELETE /api/books/:id
 */
const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingBook = await BookModel.findById(id);

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: `Book with ID '${id}' not found.`,
      });
    }

    await BookModel.delete(id);

    return res.status(200).json({
      success: true,
      message: `Book '${existingBook.title}' deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Borrow a book (Student only)
 * POST /api/books/:id/borrow
 */
const borrowBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const book = await BookModel.findById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book with ID '${id}' not found.`,
      });
    }

    // Check if user already borrowed this book and hasn't returned it yet
    const activeBorrow = await TransactionModel.findActiveBorrow(userId, id);
    if (activeBorrow) {
      return res.status(400).json({
        success: false,
        message: 'You currently have an active borrow for this book. Please return it first.',
        transaction: activeBorrow,
      });
    }

    // Check availability
    if (book.quantity <= 0 || book.status === 'borrowed') {
      return res.status(400).json({
        success: false,
        message: 'This book is currently out of stock and not available for borrowing.',
      });
    }

    // Decrement quantity & adjust status
    const newQuantity = book.quantity - 1;
    const newStatus = newQuantity === 0 ? 'borrowed' : 'available';

    await BookModel.update(id, {
      quantity: newQuantity,
      status: newStatus,
    });

    // Create transaction (14 days due)
    const transaction = await TransactionModel.createBorrow({
      userId,
      bookId: id,
      daysToDue: 14,
    });

    return res.status(200).json({
      success: true,
      message: `Book '${book.title}' borrowed successfully. Due in 14 days.`,
      transaction,
      book: {
        id: book.id,
        title: book.title,
        remainingQuantity: newQuantity,
        status: newStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Return a book (Student only)
 * POST /api/books/:id/return
 */
const returnBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const book = await BookModel.findById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book with ID '${id}' not found.`,
      });
    }

    // Find active borrow transaction for this user & book
    const activeBorrow = await TransactionModel.findActiveBorrow(userId, id);
    if (!activeBorrow) {
      return res.status(400).json({
        success: false,
        message: 'No active borrow transaction found for this book and your account.',
      });
    }

    // Update transaction to returned
    const updatedTransaction = await TransactionModel.markReturned(activeBorrow.id);

    // Increment book quantity and set status to available
    const newQuantity = (book.quantity || 0) + 1;
    await BookModel.update(id, {
      quantity: newQuantity,
      status: 'available',
    });

    return res.status(200).json({
      success: true,
      message: `Book '${book.title}' returned successfully.`,
      transaction: updatedTransaction,
      book: {
        id: book.id,
        title: book.title,
        quantity: newQuantity,
        status: 'available',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to enrich transactions with Book and User details
 */
const enrichTransactions = async (transactions) => {
  const UserModel = require('../models/userModel');
  return Promise.all(
    transactions.map(async (t) => {
      const book = await BookModel.findById(t.bookId);
      const user = await UserModel.findById(t.userId);
      return {
        ...t,
        book: book
          ? { id: book.id, title: book.title, author: book.author, isbn: book.isbn }
          : null,
        user: user
          ? { id: user.id, name: user.name, email: user.email, role: user.role }
          : null,
      };
    })
  );
};

/**
 * Get all transactions (Librarian only)
 * GET /api/transactions
 */
const getAllTransactions = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;

    const rawTransactions = await TransactionModel.getAll(filters);
    const transactions = await enrichTransactions(rawTransactions);

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get logged-in user's transaction history
 * GET /api/transactions/my
 */
const getMyTransactions = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const rawTransactions = await TransactionModel.findByUserId(userId);
    const transactions = await enrichTransactions(rawTransactions);

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  searchBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
  getAllTransactions,
  getMyTransactions,
};

