const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const bookRoutes = require("./routes/bookRoutes");
const Book = require("./models/Book");

const app = express();
const port = Number(process.env.PORT) || 3000;
let mongoError = null;

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

app.use(cors());
app.use(express.json());

app.use("/api/books", bookRoutes);

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

app.get("/", async (_request, response) => {
    const connected = mongoose.connection.readyState === 1;
    let books = [];
    let usingSampleBooks = false;

    if (connected) {
        try {
            books = await Book.find()
                .sort({ createdAt: -1 })
                .maxTimeMS(5000)
                .lean()
                .exec();
        } catch (error) {
            console.error("Failed to load books for the root endpoint:", error.message);
            mongoError = error.message;
        }
    }

    if (!books.length) {
        books = sampleBooks;
        usingSampleBooks = true;
    }

    const bookCards = books.length
        ? books.map((book) => `
            <article class="book">
                ${book.cover ? `<img src="${escapeHtml(book.cover)}" alt="${escapeHtml(book.title)} cover">` : ""}
                <div class="book-content">
                    <h2>${escapeHtml(book.title)}</h2>
                    <p class="author">By ${escapeHtml(book.author)}</p>
                    <p>${escapeHtml(book.description || "No description available.")}</p>
                    <p><strong>Price:</strong> $${Number(book.price).toFixed(2)}</p>
                    <p><strong>Stock:</strong> ${escapeHtml(book.stock)}</p>
                </div>
            </article>
        `).join("")
        : `<p class="empty">No books are available. Check MongoDB connection and refresh this page.</p>`;

    response.type("html").send(`<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>BookStore API</title>
    <style>
        :root { color-scheme: light; font-family: Arial, sans-serif; }
        body { margin: 0; background: #f4f6f8; color: #1f2937; }
        header { padding: 2rem 1rem; background: #1d4ed8; color: white; }
        main { max-width: 1100px; margin: auto; padding: 1.5rem 1rem 3rem; }
        .status { margin: 0.5rem 0 1.5rem; color: #475569; }
        .books { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }
        .book { display: flex; gap: 1rem; padding: 1rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px #0001; }
        .book img { width: 100px; height: 145px; object-fit: cover; border-radius: 5px; }
        .book-content { flex: 1; }
        h1, h2, p { margin-top: 0; }
        h2 { margin-bottom: 0.35rem; font-size: 1.2rem; }
        .author { color: #64748b; font-style: italic; }
        .empty { padding: 1rem; background: #fff7ed; border: 1px solid #fdba74; border-radius: 8px; }
        a { color: #1d4ed8; }
    </style>
</head>
<body>
    <header><main><h1>BookStore</h1><p>BookStore API is running on port ${port}</p></main></header>
    <main>
        <p class="status"><strong>Database:</strong> ${connected && !mongoError ? "Connected" : "Unavailable"} &middot; <strong>Books:</strong> ${books.length}${usingSampleBooks ? " (sample data)" : ""}</p>
        <section class="books">${bookCards}</section>
        <p><a href="/api/books">View books as JSON</a> &middot; <a href="/health">View health status</a></p>
    </main>
</body>
</html>`);
});

app.get("/health", (_request, response) => {
    const connected = mongoose.connection.readyState === 1;

    response.status(connected ? 200 : 503).json({
        status: connected ? "ok" : "degraded",
        mongo: connected ? "connected" : "disconnected",
        error: connected ? null : mongoError,
    });
});

async function connectToMongo() {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
        mongoError = "MONGODB_URI or MONGO_URI is not configured";
        console.error(mongoError);
        return;
    }

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        mongoError = null;
        console.log("MongoDB connected!");
    } catch (error) {
        mongoError = error.message;
        console.error("MongoDB connection failed:", mongoError);
        console.error("Retrying MongoDB connection in 10 seconds...");
        setTimeout(connectToMongo, 10000);
    }
}

async function startServer() {
    const server = app.listen(port, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${port}`);
    });

    await connectToMongo();

    return server;
}

module.exports = { app, startServer };
