require("dotenv").config();

const { startServer } = require("./server");

startServer().catch((error) => {
    console.error("Server startup failed:", error);
    process.exitCode = 1;
});