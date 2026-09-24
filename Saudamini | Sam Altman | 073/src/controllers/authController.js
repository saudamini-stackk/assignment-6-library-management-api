const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const { generateToken } = require('../utils/jwt');

/**
 * Register a new user (Student / Librarian)
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Default role is 'student' unless specified as 'librarian'
    const assignedRole = role === 'librarian' ? 'librarian' : 'student';

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
    });

    // Generate JWT
    const token = generateToken({
      userId: newUser.userId,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    // Omit password from response
    const userResponse = {
      userId: newUser.userId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    return res.status(201).json({
      success: true,
      message: `User registered successfully as ${assignedRole}.`,
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user & get JWT token
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.userId || user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const userResponse = {
      userId: user.userId || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get logged-in user profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
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
 * Update logged-in user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const updateData = {};

    if (name) updateData.name = name;

    const updatedUser = await UserModel.update(req.user.userId, updateData);
    delete updatedUser.password;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
