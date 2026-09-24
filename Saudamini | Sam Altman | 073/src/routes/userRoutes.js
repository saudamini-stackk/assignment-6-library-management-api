const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validator');
const { updateRoleValidation } = require('../utils/validation');

// All user management routes require librarian role
router.use(authenticate, authorize('librarian'));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id/role', updateRoleValidation, validate, userController.updateUserRole);
router.delete('/:id', userController.deleteUser);

module.exports = router;
