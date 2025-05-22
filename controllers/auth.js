const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @desc    Register a new user
 * @route   POST /auth/signup
 * @access  Public
 */
exports.signUp = (req, res, next) => {
  const { email, name, DOB, password } = req.body;

  // Check if the user already exists
  User.findOne({ email: email })
    .then(user => {
      if (user) {
        const error = new Error('Email already exists');
        error.statusCode = 400;
        throw error;
      }
      // Hash the password before saving
      return bcrypt.hash(password, 12);
    })
    .then(hashedPassword => {
      // Create and save new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        DOB
      });
      return newUser.save();
    })
    .then(result => {
      res.status(201).json({ message: 'User created successfully' });
    })
    .catch(err => {
      res.status(err.statusCode || 500).json({ message: err.message || 'Internal Server Error' });
    });
};

/**
 * @desc    Get all users (admin use case)
 * @route   GET /auth/users
 * @access  Admin
 */
exports.getUsers = (req, res, next) => {
  User.find()
    .then(users => {
      if (users.length === 0) {
        const error = new Error('No users found!');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'All users', users: users });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

/**
 * @desc    Get profile of currently logged-in user
 * @route   GET /auth/profile
 * @access  Private
 */
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password -__v'); // Exclude sensitive fields
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: 'User profile retrieved successfully', user });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * @desc    Login a user and return JWT token
 * @route   POST /auth/login
 * @access  Public
 */
exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        throw new Error("Email doesn't exist!");
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        throw new Error('Password not matched');
      }
      // Generate JWT token
      const token = jwt.sign(
        {
          name: loadedUser.name,
          email: loadedUser.email,
          userId: loadedUser._id.toString()
        },
        process.env.JWT_SECRET,
        { expiresIn: '23h' }
      );
      res.json({ message: 'User logged in!', token, userId: loadedUser._id.toString() });
    })
    .catch(err => {
      next(err);
    });
};

/**
 * @desc    Update user profile info (name, email, password, DOB)
 * @route   PUT /auth/update
 * @access  Private
 */
exports.userUpdate = async (req, res, next) => {
  const userId = req.userId;
  const { name, email, password, DOB } = req.body;

  try {
    const user = await User.findById(userId);

    // Authorization check
    if (!user || user._id.toString() !== userId) {
      const error = new Error('User is not authorized to make changes');
      error.statusCode = 403;
      throw error;
    }

    // Update fields if provided
    user.name = name || user.name;
    user.email = email || user.email;
    if (DOB !== undefined) user.DOB = DOB;

    if (password && password.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
    }

    await user.save();
    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * @desc    Delete the logged-in user
 * @route   DELETE /auth/delete
 * @access  Private
 */
exports.deleteUser = (req, res, next) => {
  const userId = req.userId;

  User.findByIdAndDelete(userId)
    .then(result => {
      res.json({ message: 'User deleted!' });
    })
    .catch(err => {
      console.log(err);
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};
