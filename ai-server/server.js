/******************************* Imports **********************************/
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import imageAnalysisRouter from './routes/imageAnalysis.js';
import recommendationsRouter from './routes/recommendations.js';
import organizationRouter from './routes/organization.js';

// Load environment variables
dotenv.config();

/**************************** Create Server **********************************/
const app = express();
const PORT = process.env.AI_PORT || 8081;
const HOST = '0.0.0.0';

/************************* CORS Configuration ********************************/
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:80',
      'http://localhost',
      'http://localhost:8080',  // Backend API
    ];

app.use(cors({
  origin: function (origin, callback) {
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

/************************** Setup Middleware *******************************/
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/************************** Setup Routers *******************************/
app.use('/api/analyze', imageAnalysisRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/organize', organizationRouter);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Second Space AI Server',
    status: 'running',
    version: '0.1.0',
    capabilities: {
      imageAnalysis: 'Analyze images for content, emotions, and tags',
      recommendations: 'Suggest related media and spaces',
      organization: 'Auto-organize media into categories',
    },
    endpoints: {
      analyze: '/api/analyze',
      recommendations: '/api/recommendations',
      organize: '/api/organize',
    }
  });
});

/************************** Error Handlers *******************************/
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/************************** Start Server *******************************/
app.listen(PORT, HOST, () => {
  console.log(`?? AI Server is running on http://${HOST}:${PORT}`);
  console.log(`?? Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`?? CORS enabled for: ${allowedOrigins.join(', ')}`);
  
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.warn('??  WARNING: OPENAI_API_KEY not set. AI features will not work!');
  } else {
    console.log('? OpenAI API key configured');
  }
});
