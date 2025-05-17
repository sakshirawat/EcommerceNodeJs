const express = require('express');
const router = express.Router();

const shopController = require('../controllers/shop'); // Controller handling shop logic
const isAuth = require('../middleware/isAuth'); // Middleware for JWT-based authentication

// ===================== Product Routes ===================== //

// Route to add a new product/item (e.g., by admin)
router.post('/addItem', shopController.postItems);

// Route to get all available items/products
router.get('/getItems', shopController.getItems);

// Route to get products by category
router.get('/getItemsByCategory/:category', shopController.getProductsByCategory);

// ===================== Cart Routes ===================== //

// Route to add an item to the user's cart (requires authentication)
router.post('/cart', isAuth, shopController.shopItems);

// Route to get all items from the user's cart (requires authentication)
router.get('/getcart', isAuth, shopController.getCartItems);

// Route to remove a specific item from the user's cart (requires authentication)
router.delete('/removecartitem/:productId', isAuth, shopController.removeFromCart);

// ===================== Order Routes ===================== //

// Route to place an order from the cart (requires authentication)
router.post('/orders', isAuth, shopController.postOrder);

// Route to get all orders for a user (requires authentication)
router.get('/orders', isAuth, shopController.getOrders);

// Route to filter user orders by month (not authenticated — consider protecting it)
router.post('/orders/filter', shopController.getOrderFilter);

// ===================== Wishlist Routes ===================== //

// Route to get the user's wishlist items (requires authentication)
router.get('/wishlist', isAuth, shopController.getWishlist);

// Route to add a product to the user's wishlist (requires authentication)
router.post('/addWishlist', isAuth, shopController.postWishlist);

// Route to remove a specific product from the wishlist (requires authentication)
router.delete('/wishlist/:productId', isAuth, shopController.removeFromWishlist);

// Export the router for use in the main application
module.exports = router;
