import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from "./routes/uploadRoutes.js"
import cors from 'cors';
import fs from 'fs';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

['PORT', 'MONGO_URI', 'RAZORPAY'].forEach(variable => {
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined');
    process.exit(1);
  }
});
const port = process.env.PORT 

// Database connection
connectDB();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Content-Disposition',
    'X-Requested-With'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));



// Middleware
// *CRITICAL*:  express.json() and express.urlencoded() MUST come *before* your route handlers.
app.use(express.json({ type: 'application/json' }));  // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(cookieParser());



// Serve static files from uploads directory.  Important to be able to access uploaded files.
const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));


// Routes
app.use('/api/upload', uploadRoutes); //  uploadRoutes likely uses multer, so it's fine here.
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/config/razorpay', (req, res) =>
  res.send({ clientId: process.env.RAZORPAY }));



// Production setup
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}



// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);
