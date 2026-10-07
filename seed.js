require("dotenv").config();

const mongoose = require("mongoose");
const Book = require("./models/Book");

const sampleBooks = [
    {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        price: 12.99,
        description: "A classic American novel set in the Jazz Age.",
        stock: 15,
        cover: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
    },
    {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        price: 14.99,
        description: "A powerful story about justice, courage, and compassion.",
        stock: 20,
        cover: "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg",
    },
    {
        title: "1984",
        author: "George Orwell",
        price: 13.5,
        description: "A dystopian novel about surveillance and totalitarianism.",
        stock: 10,
        cover: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
    },
    {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        price: 11.99,
        description: "A classic romance about manners, family, and marriage.",
        stock: 25,
        cover: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
    },
    {
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        price: 15.99,
        description: "Bilbo Baggins embarks on an unexpected adventure.",
        stock: 12,
        cover: "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg",
    },
];

async function seedDatabase() {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("MONGODB_URI or MONGO_URI is not configured");
    }

    await mongoose.connect(mongoUri);
    await Book.deleteMany({});
    await Book.insertMany(sampleBooks);
    console.log(`${sampleBooks.length} books added successfully.`);
}

seedDatabase()
    .catch((error) => {
        console.error("Failed to seed books:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
