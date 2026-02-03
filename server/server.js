/* server/server.js */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { connectToPostgreSQL } = require("./config/database");
const { errorHandler } = require("./utils/errorHandler");
const atsRoutes = require("./routes/atsRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:5180",
    credentials: true,
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Import routes
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const geminiRoutes = require("./routes/geminiRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

// Register API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
// CHANGED: Mounted to /api/ai/enhance to fix the 404 error
app.use("/api/ai/enhance", geminiRoutes); 
app.use("/api/ats", atsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Error handling
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    const isConnected = await connectToPostgreSQL();
    if (!isConnected) {
      console.error("❌ Failed to connect to PostgreSQL");
      process.exit(1);
    }
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error(" Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error(" Unhandled Rejection:", error);
  process.exit(1);
});

startServer();