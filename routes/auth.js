const express = require('express');
const authController = require('../controllers/auth'); // Controller handling authentication logic
const validation = require('../middleware/validation'); // Middleware for request validation
const isAuth = require('../middleware/isAuth'); // Middleware for verifying JWT authentication

const router = express.Router(); // Create a new router object

// Route to register a new user
// Uses validation middleware to check for valid user input before calling the controller
router.post('/signup', validation.validateUser, authController.signUp);

// Route to get all users (for admin or debugging purposes)
// No authentication required here – in a real app, consider adding admin protection
router.get('/users', authController.getUsers);

// Route to log in a user
// Controller verifies credentials and issues JWT
router.post('/login', authController.login);

// Route to get user profile details
// Uses `isAuth` middleware to ensure request has valid JWT
router.get('/profile', isAuth, authController.getUserProfile);

// Route to update user information
// Protected by `isAuth` middleware to ensure only logged-in users can update their data
router.put('/updateUser', isAuth, authController.userUpdate);

// Route to delete user account
// Protected by `isAuth` middleware to ensure only logged-in users can delete their account
router.delete('/deleteUser', isAuth, authController.deleteUser);

// Export the router to be used in the main app
module.exports = router;
