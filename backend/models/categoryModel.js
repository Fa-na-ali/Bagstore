const mongoose = require("mongoose");


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxLength: 32,
        unique: true,
    },
    isExist: {
        type: Boolean,
        default: true,
      },
      offer: {
        type: String
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


const Category = mongoose.model("Category", categorySchema);

module.exports = Category;