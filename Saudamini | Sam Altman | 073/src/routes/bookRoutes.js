const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validator');
const {
  createBookValidation,
  updateBookValidation,
} = require('../utils/validation');

// Public / General routes
router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.get('/:id', bookController.getBookById);

// Librarian only routes
router.post(
  '/',
  authenticate,
  authorize('librarian'),
  createBookValidation,
  validate,
  bookController.createBook
);

router.put(
  '/:id',
  authenticate,
  authorize('librarian'),
  updateBookValidation,
  validate,
  bookController.updateBook
);

router.delete(
  '/:id',
  authenticate,
  authorize('librarian'),
  bookController.deleteBook
);

// Student only routes (Borrow & Return)
router.post(
  '/:id/borrow',
  authenticate,
  authorize('student'),
  bookController.borrowBook
);

router.post(
  '/:id/return',
  authenticate,
  authorize('student'),
  bookController.returnBook
);

// Transaction routes (Borrow & Return transaction history)
const transactionRouter = express.Router();
transactionRouter.get('/my', authenticate, bookController.getMyTransactions);
transactionRouter.get('/', authenticate, authorize('librarian'), bookController.getAllTransactions);

module.exports = {
  bookRouter: router,
  transactionRouter,
};

