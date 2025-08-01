const mongoose = require('mongoose');
const { Schema } = mongoose;

// Product Schema
const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  pdImage: {
    type: [String],
    default: []
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  isExist: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  review: {
    type: Schema.Types.ObjectId,
    ref: 'Review'
  },
  offer: {
    type: String,

  },
  ordered: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    required: true
  }
},
  {
    timestamps: true,
  }
);


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
