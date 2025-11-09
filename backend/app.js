/******************************* Imports **********************************/
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import spaceRouter from "./src/routes/spacesRoutes.js";
import mediaRouter from "./src/routes/mediaRoutes.js";
import userRouter from "./src/routes/userRoutes.js";

/**************************** Create Server **********************************/
const app = express();
const PORT = process.env.PORT || 8080;
const HOST = "0.0.0.0";

/************************* Security Middleware ********************************/
// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/************************* Cors Configuration ********************************/
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:5173',       // Vite dev server
      'http://localhost:80',         // Docker frontend with port
      'http://localhost',            // Docker frontend without port
      'https://cfurley.github.io',   // GitHub Pages
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' })); // Increased limit to 10mb for all JSON payloads

/************************** Setup Middleware *******************************/
// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Apply rate limiters
app.use('/user/authentication', authLimiter);
app.use('/user', apiLimiter);
app.use('/spaces', apiLimiter);
app.use('/media', apiLimiter);

/************************** Setup Routers *******************************/
app.use("/spaces", spaceRouter);
app.use("/media", mediaRouter);
app.use("/user", userRouter);

// Handle homepage route - Health check
app.get("/", (req, res) => {
  res.json({
    message: "Second Space API",
    status: "running",
    version: "0.1.0",
    security: {
      helmet: "enabled",
      rateLimit: "enabled",
      cors: "enabled"
    },
    endpoints: {
      users: "/user",
      spaces: "/spaces",
      media: "/media",
    }
  });
});


/************************** Setup Error Handlers *******************************/
// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler 
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't expose stack traces in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(isDevelopment && { stack: err.stack })
  });
});



/************************** Start the Server *******************************/
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security: Helmet + Rate Limiting enabled`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
});
