# Soroto E-commerce Website Backend

This is the backend API for the **Soroto E-commerce Website**, built using Node.js, Express.js, and MongoDB. It provides RESTful APIs for user authentication, product management, shopping cart, and wishlist functionalities.

---

## Features

- User Authentication (Sign Up, Sign In) with JWT
- Add products to Cart
- Add products to Wishlist
- Secure routes with authentication middleware
- MongoDB database for data storage

---

## Technologies Used

- Node.js
- Express.js
- MongoDB (Mongoose)
- JSON Web Tokens (JWT)
- bcrypt for password hashing
- dotenv for environment variables

---


### Prerequisites

- Node.js installed (v14+ recommended)
- MongoDB database (local or cloud, e.g., MongoDB Atlas)
- Postman or any API client for testing

Project Structure
bash
Copy
Edit
/src
  /controllers
  /models
  /routes
  /middleware
  server.js
.env
package.json
Authentication
Passwords are hashed using bcrypt before storing in the database.

JWT tokens are used to authenticate protected routes.

Include the token in the Authorization header as Bearer <token> for protected requests.


