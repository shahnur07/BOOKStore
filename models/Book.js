const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        author: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        description: { type: String, trim: true },
        stock: { type: Number, default: 0, min: 0 },
        cover: { type: String, trim: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
