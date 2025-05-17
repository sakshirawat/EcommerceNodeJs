
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name : {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    DOB: {
        type: Date,
        required: true
    },
    wishlist: {
        Items: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
          ]
    },
    cart: {
        Items:[],
        CartTotal:{
            type:Number
        }
    }
})

module.exports= mongoose.model('User', userSchema)