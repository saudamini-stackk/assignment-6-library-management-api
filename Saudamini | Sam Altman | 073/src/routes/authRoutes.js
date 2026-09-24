const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validator');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
} = require('../utils/validation');

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, updateProfileValidation, validate, authController.updateProfile);

module.exports = router;
