const { body, param, query } = require('express-validator');

// Register validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['student', 'librarian'])
    .withMessage("Role must be either 'student' or 'librarian'"),
];

// Login validation rules
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Profile update validation
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
];

// Create book validation rules
const createBookValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ min: 1, max: 150 })
    .withMessage('Author must be between 1 and 150 characters'),
  body('isbn')
    .trim()
    .notEmpty()
    .withMessage('ISBN is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be an integer greater than or equal to 0'),
];

// Update book validation rules
const updateBookValidation = [
  param('id').trim().notEmpty().withMessage('Book ID parameter is required'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty'),
  body('author')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Author cannot be empty'),
  body('isbn')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('ISBN cannot be empty'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be an integer greater than or equal to 0'),
  body('status')
    .optional()
    .isIn(['available', 'borrowed'])
    .withMessage("Status must be either 'available' or 'borrowed'"),
];

// Update role validation rules
const updateRoleValidation = [
  param('id').trim().notEmpty().withMessage('User ID is required'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['student', 'librarian'])
    .withMessage("Role must be either 'student' or 'librarian'"),
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  createBookValidation,
  updateBookValidation,
  updateRoleValidation,
};
