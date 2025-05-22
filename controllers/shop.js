const User = require('../models/User');
const Items = require('../models/Products');
const Order = require('../models/Order');

// Create a new item/product
exports.postItems = (req, res, next) => {
  const { title, price, description, imageUrl ,category } = req.body;

  const item = new Items({
    title,
    price,
    description,
    imageUrl,
    category
  });

  item.save()
    .then(() => {
      console.log('Item created');
      res.status(201).json({ message: "Item created" });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Failed to create item' });
    });
};

// Get products by category (case-insensitive)
exports.getProductsByCategory = async (req, res) => {
  const category = req.params.category;

  try {
    const products = await Items.find({ category: { $regex: new RegExp(`^${category}$`, 'i') } });
    res.json({ products });
  } catch (err) {
    console.error('Error fetching products by category:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch all available items
exports.getItems = (req, res, next) => {
  Items.find()
    .then(items => {
      return res.status(200).json({ message: 'Items', items });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    });
};

// Add item to user's cart
exports.shopItems = (req, res, next) => {
  const itemId = req.body._id;
  const itemName = req.body.title;
  const quantity = parseInt(req.body.quantity) || 1;

  Items.findById(itemId)
    .then(item => {
      if (!item) {
        const error = new Error('Item does not exist');
        error.statusCode = 404;
        throw error;
      }

      return User.findById(req.userId)
  .then(user => {
    const updatedCartItems = [...user.cart.Items];
    const CartItemIndex = updatedCartItems.findIndex(cp => item._id.toString() === cp.ItemId.toString());

    if (CartItemIndex >= 0) {
      updatedCartItems[CartItemIndex].quantity += quantity;
      updatedCartItems[CartItemIndex].TotalPrice += item.price * quantity;
    } else {
      updatedCartItems.push({
        ItemId: itemId,
        ItemName: itemName,
        quantity: quantity,
        price: item.price,
        TotalPrice: item.price * quantity
      });
    }

    // Assign updatedCartItems back to user.cart.Items
    user.cart.Items = updatedCartItems;

    // Now recalculate CartTotal based on the updated items
    user.cart.CartTotal = user.cart.Items.reduce((total, item) => {
      const price = typeof item.TotalPrice === 'number' && !isNaN(item.TotalPrice) ? item.TotalPrice : 0;
      return total + price;
    }, 0);

    return user.save().then(() => {
      res.status(200).json({ message: 'Item added to cart' });
    });
  });

    })
    .catch(err => {
      next(err);
    });
};

// Get items in user's cart
exports.getCartItems = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cart = user.cart || { Items: [], CartTotal: 0 };
    return res.status(200).json({ message: 'Cart fetched successfully', cart });
  } catch (err) {
    console.error('Error in getCartItems:', err);
    return res.status(500).json({ message: 'Failed to fetch cart' });
  }
};

// Remove specific item from cart
exports.removeFromCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const productId = req.params.productId || req.body.itemId;

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.cart.Items = user.cart.Items.filter(item => item.ItemId.toString() !== productId);
    user.cart.CartTotal = user.cart.Items.reduce((sum, item) => sum + item.TotalPrice, 0);

    await user.save();
    return res.status(200).json({ message: 'Item removed successfully' });
  } catch (err) {
    console.error('Error in removeFromCart:', err);
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
};

// Get wishlist products by IDs stored in user document
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('wishlist');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const wishlistItemIds = user.wishlist.Items;

    if (!wishlistItemIds || wishlistItemIds.length === 0) {
      return res.status(200).json({ wishlist: [] });
    }

    const products = await Items.find({ _id: { $in: wishlistItemIds } });
    res.status(200).json({ wishlist: products });
  } catch (err) {
    next(err);
  }
};

// Add product to wishlist (if not already added)
exports.postWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const productExists = await Items.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.wishlist.Items.includes(productId)) {
      return res.status(200).json({ message: 'Product already in wishlist' });
    }

    user.wishlist.Items.push(productId);
    await user.save();

    return res.status(201).json({ message: 'Product added to wishlist' });
  } catch (err) {
    console.error('Error in postWishlist:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  const productId = req.params.productId;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.wishlist.Items = user.wishlist.Items.filter(id => id.toString() !== productId);
    await user.save();

    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Place a new order using items from the cart
exports.postOrder = (req, res, next) => {
  const userId = req.userId;

  if (!userId) {
    const error = new Error('User ID is required');
    error.statusCode = 400;
    throw error;
  }

  User.findById(userId)
    .then(user => {
      if (!user || !user.cart.Items.length) {
        const error = new Error('No items in cart or user not found');
        error.statusCode = 400;
        throw error;
      }

      const items = user.cart.Items.map(i => ({
        quantity: i.quantity,
        price: i.price,
        ItemId: i.ItemId,
        ItemName: i.ItemName
      }));

      const totalAmount = user.cart.CartTotal || 0;

      const order = new Order({
        userId: user._id,
        OrderItems: items,
        Total: totalAmount
      });

      return order.save()
        .then(savedOrder => {
          // Clear cart after placing order
          user.cart.Items = [];
          user.cart.CartTotal = 0;
          return user.save().then(() => savedOrder);
        });
    })
    .then(savedOrder => {
      res.status(201).json({ message: 'Order placed successfully', order: savedOrder });
    })
    .catch(err => {
      next(err);
    });
};

// Fetch all orders of the user
exports.getOrders = (req, res, next) => {
  Order.find({ userId: req.userId })
    .sort({ dateOn: -1 }) // Sort orders by most recent
    .then(orders => {
      if (!orders.length) {
        return res.status(404).json({ message: 'No orders found for this user.' });
      }

      res.status(200).json({ message: 'Orders fetched successfully', orders });
    })
    .catch(err => {
      console.error('[GET /orders] Error:', err);
      res.status(500).json({ message: 'Fetching orders failed.', error: err.message });
    });
};

// Filter orders by month (POST /order-filter)
exports.getOrderFilter = (req, res, next) => {
  const monthValue = parseInt(req.body.month);

  Order.find({ userId: req.userId })
    .then(orders => {
      if (!orders.length) {
        const error = new Error('No orders found');
        error.statusCode = 404;
        throw error;
      }

      const orderFilterItems = orders.filter(order =>
        order.DateOn.getMonth() === monthValue
      );

      if (!orderFilterItems.length) {
        const error = new Error('No orders for the selected month');
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({ message: 'Orders of the month', data: orderFilterItems });
    })
    .catch(err => {
      next(err);
    });
};

exports.increaseQuantity = async (req, res, next) => {
    const userId = req.userId;
    const productId = req.params.productId;
  
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      const cartItem = user.cart.Items.find(item => item.ItemId.toString() === productId);
      if (!cartItem) return res.status(404).json({ message: 'Product not found in cart' });
  
      // ✅ Safely update quantity and total price
      cartItem.quantity = Number(cartItem.quantity || 0) + 1;
      cartItem.TotalPrice = Number(cartItem.price || 0) * Number(cartItem.quantity);
  
      // ✅ Recalculate cart total
      user.cart.CartTotal = user.cart.Items.reduce((total, item) => {
        return total + (Number(item.TotalPrice) || 0);
      }, 0);
  
      // ✅ Make sure Mongoose detects nested change
      user.markModified('cart');
  
      await user.save(); // This will persist changes
      res.status(200).json({ message: 'Quantity increased', cart: user.cart });
  
    } catch (err) {
      next(err);
    }
  };
  
  
  // Decrease quantity of product in cart
  exports.decreaseQuantity = async (req, res, next) => {
    const userId = req.userId;
    const productId = req.params.productId;
  
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      const cartItemIndex = user.cart.Items.findIndex(item => item.ItemId.toString() === productId);
      if (cartItemIndex === -1) return res.status(404).json({ message: 'Product not found in cart' });
  
      let cartItem = user.cart.Items[cartItemIndex];
      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        cartItem.TotalPrice = cartItem.price * cartItem.quantity;
      } else {
        // Remove item if quantity goes below 1
        user.cart.Items.splice(cartItemIndex, 1);
      }
  
      // recalculate cart total
      user.cart.CartTotal = user.cart.Items.reduce((total, item) => total + item.TotalPrice, 0);

      user.markModified('cart');
  
      await user.save();
      res.status(200).json({ message: 'Quantity decreased', cart: user.cart });
    } catch (err) {
      next(err);
    }
  };
