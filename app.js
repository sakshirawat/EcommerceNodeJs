require('dotenv').config();


const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

// Import route handlers
const authRouter = require('./routes/auth');
const shopRouter = require('./routes/shop');

const app = express();

// ===================== Middleware ===================== //

// CORS configuration to allow requests from all origins (for development; restrict in production)
const corsOptions = {
  origin: '*', // Can be restricted to specific origin like 'http://localhost:5500'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming JSON requests
app.use(bodyParser.json());

// ===================== Route Mounting ===================== //

// Routes for authentication (signup, login, profile management)
app.use('/auth', authRouter);

// Routes for shopping functionality (items, cart, wishlist, orders)
app.use('/shop', shopRouter);

// ===================== Error Handling Middleware ===================== //
app.use((error, req, res, next) => {
  console.log(error); // Log the error for debugging
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  console.log(status, message);
  res.status(status).json({ message: message, data: data });
});

// ===================== Database Connection & Server Start ===================== //

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })

