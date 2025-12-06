import express from "express";
import cors from "cors";
import spaceRouter from "./src/routes/spacesRoutes.js";
import mediaRouter from "./src/routes/mediaRoutes.js";
import userRouter from "./src/routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = "0.0.0.0";

// CORS Configuration - Allow frontend to communicate with backend
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "http://localhost:5173", // Vite dev server (default)
      "http://localhost:3001", // Vite dev server (alternate port)
      "http://localhost:80", // Docker frontend with port
      "http://localhost", // Docker frontend without port
      "https://cfurley.github.io", // GitHub Pages
    ];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Explicitly handle preflight for all routes (some proxies/CDNs require this)
app.options('*', cors());

// Middleware for JSON support with increased size limit for base64 media uploads
// 50MB limit to accommodate base64-encoded files (base64 increases size by ~33%)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

/****** SETUP ROUTERS HERE ******/
app.use("/spaces", spaceRouter);
app.use("/media", mediaRouter);
app.use("/user", userRouter);
//app.use('/containers', containerRouter);

// Handle homepage route - Health check
app.get("/", (req, res) => {
  res.json({
    message: "Second Space API",
    status: "running",
    version: "0.1.0",
    endpoints: {
      users: "/user",
      spaces: "/spaces",
      media: "/media",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start the server and listen for connections
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(", ")}`);
});
