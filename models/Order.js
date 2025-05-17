const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  dateOn: { 
    type: Date,
    default: Date.now
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  OrderItems: [{
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    ItemId: {
      type: String,
      ref: 'Items',
      required: true
    },
    ItemName: {
      type: String,
      required: true
    }
  }],
  Total: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Order', orderSchema);
