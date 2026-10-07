const mongoose = require("mongoose");
const Book = require("../models/Book");

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

async function getBooks(_request, response) {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        response.json({ success: true, data: books });
    } catch (error) {
        response.status(500).json({ success: false, message: error.message });
    }
}

async function getBookById(request, response) {
    if (!isValidId(request.params.id)) {
        return response.status(400).json({ success: false, message: "Invalid book ID" });
    }

    try {
        const book = await Book.findById(request.params.id);
        if (!book) {
            return response.status(404).json({ success: false, message: "Book not found" });
        }
        return response.json({ success: true, data: book });
    } catch (error) {
        return response.status(500).json({ success: false, message: error.message });
    }
}

async function createBook(request, response) {
    try {
        const book = await Book.create(request.body);
        return response.status(201).json({ success: true, data: book });
    } catch (error) {
        return response.status(400).json({ success: false, message: error.message });
    }
}

async function updateBook(request, response) {
    if (!isValidId(request.params.id)) {
        return response.status(400).json({ success: false, message: "Invalid book ID" });
    }

    try {
        const book = await Book.findByIdAndUpdate(request.params.id, request.body, {
            new: true,
            runValidators: true,
        });
        if (!book) {
            return response.status(404).json({ success: false, message: "Book not found" });
        }
        return response.json({ success: true, data: book });
    } catch (error) {
        return response.status(400).json({ success: false, message: error.message });
    }
}

async function deleteBook(request, response) {
    if (!isValidId(request.params.id)) {
        return response.status(400).json({ success: false, message: "Invalid book ID" });
    }

    try {
        const book = await Book.findByIdAndDelete(request.params.id);
        if (!book) {
            return response.status(404).json({ success: false, message: "Book not found" });
        }
        return response.json({ success: true, message: "Book deleted" });
    } catch (error) {
        return response.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook };
