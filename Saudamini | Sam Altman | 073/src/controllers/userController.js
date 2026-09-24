const UserModel = require('../models/userModel');

/**
 * Get all users (Librarian only)
 * GET /api/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await UserModel.getAll();
    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user details by ID (Librarian only)
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID '${id}' not found.`,
      });
    }

    delete user.password;

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role (Librarian only)
 * PUT /api/users/:id/role
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID '${id}' not found.`,
      });
    }

    const updatedUser = await UserModel.updateRole(id, role);
    delete updatedUser.password;

    return res.status(200).json({
      success: true,
      message: `User role updated to '${role}' successfully.`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (Librarian only)
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting oneself
    if (req.user && req.user.userId === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.',
      });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID '${id}' not found.`,
      });
    }

    await UserModel.delete(id);

    return res.status(200).json({
      success: true,
      message: `User '${user.name}' (${user.email}) deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
};
