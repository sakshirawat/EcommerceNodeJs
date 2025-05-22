const express = require('express');
const router = express.Router();

const shopController = require('../controllers/shop'); // Controller handling shop logic
const isAuth = require('../middleware/isAuth'); // Middleware for JWT-based authentication

/**
 * @swagger
 * tags:
 *   name: Shop
 *   description: Product, Cart, Order and Wishlist management
 */

// ===================== Product Routes ===================== //

/**
 * @swagger
 * /addItem:
 *   post:
 *     summary: Add a new product/item (e.g., admin)
 *     tags: [Shop]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Product"
 *               category:
 *                 type: string
 *                 example: "Electronics"
 *               price:
 *                 type: number
 *                 example: 49.99
 *               description:
 *                 type: string
 *                 example: "A great product"
 *     responses:
 *       201:
 *         description: Product added successfully
 *       400:
 *         description: Bad request
 */
router.post('/addItem', shopController.postItems);

/**
 * @swagger
 * /getItems:
 *   get:
 *     summary: Get all available items/products
 *     tags: [Shop]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   category:
 *                     type: string
 *                   price:
 *                     type: number
 */
router.get('/getItems', shopController.getItems);

/**
 * @swagger
 * /getItemsByCategory/{category}:
 *   get:
 *     summary: Get products by category
 *     tags: [Shop]
 *     parameters:
 *       - in: path
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: Product category to filter by
 *     responses:
 *       200:
 *         description: List of products in category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/getItemsByCategory/:category', shopController.getProductsByCategory);

// ===================== Cart Routes ===================== //

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add an item to the user's cart
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "123abc"
 *               quantity:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Item added to cart
 *       401:
 *         description: Unauthorized
 */
router.post('/cart', isAuth, shopController.shopItems);

/**
 * @swagger
 * /getcart:
 *   get:
 *     summary: Get all items from the user's cart
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's cart items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get('/getcart', isAuth, shopController.getCartItems);

/**
 * @swagger
 * /removecartitem/{productId}:
 *   delete:
 *     summary: Remove a specific item from the user's cart
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of product to remove from cart
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       401:
 *         description: Unauthorized
 */
router.delete('/removecartitem/:productId', isAuth, shopController.removeFromCart);

// ===================== Order Routes ===================== //

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place an order from the cart
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/orders', isAuth, shopController.postOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders for the logged-in user
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 */
router.get('/orders', isAuth, shopController.getOrders);

/**
 * @swagger
 * /orders/filter:
 *   post:
 *     summary: Filter user orders by month (consider protecting)
 *     tags: [Shop]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               month:
 *                 type: string
 *                 example: "2025-05"
 *     responses:
 *       200:
 *         description: Filtered orders
 */
router.post('/orders/filter', shopController.getOrderFilter);

// ===================== Wishlist Routes ===================== //

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get the user's wishlist items
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist items
 */
router.get('/wishlist', isAuth, shopController.getWishlist);

/**
 * @swagger
 * /addWishlist:
 *   post:
 *     summary: Add a product to the user's wishlist
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "123abc"
 *     responses:
 *       200:
 *         description: Product added to wishlist
 */
router.post('/addWishlist', isAuth, shopController.postWishlist);

/**
 * @swagger
 * /wishlist/{productId}:
 *   delete:
 *     summary: Remove a product from the wishlist
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of product to remove
 *     responses:
 *       200:
 *         description: Product removed from wishlist
 */
router.delete('/wishlist/:productId', isAuth, shopController.removeFromWishlist);

/**
 * @swagger
 * /cart/increase/{productId}:
 *   post:
 *     summary: Increase quantity of a product in the cart
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of product to increase quantity
 *     responses:
 *       200:
 *         description: Quantity increased
 */
router.post('/cart/increase/:productId', isAuth, shopController.increaseQuantity);

/**
 * @swagger
 * /cart/decrease/{productId}:
 *   post:
 *     summary: Decrease quantity of a product in the cart
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of product to decrease quantity
 *     responses:
 *       200:
 *         description: Quantity decreased
 */
router.post('/cart/decrease/:productId', isAuth, shopController.decreaseQuantity);

module.exports = router;
