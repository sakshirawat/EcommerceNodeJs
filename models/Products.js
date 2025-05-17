const User = require('../models/User')
const mongoose = require('mongoose')
const Schema  = mongoose.Schema

const itemsSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price : {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Items',itemsSchema)
