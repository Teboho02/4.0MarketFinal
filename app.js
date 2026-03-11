import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

// Routes
import testRoutes from './routes/testRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import advertsRoutes from './routes/advertsRoutes.js';
import yocoRoutes from './routes/yocoRoutes.js';
import categoriesRoutes from './routes/categoriesRoutes.js';
import suppliersRoutes from './routes/suppliersRoutes.js';
import ordersRoutes from './routes/ordersRoutes.js';


// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.options('*', cors());

// Serve static files from the built frontend
const frontendPath = path.join(__dirname, './app/dist');
app.use(express.static(frontendPath));

// API Routes (with /api prefix to avoid conflicts)
app.use('/api', testRoutes);
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', advertsRoutes);
app.use('/api', yocoRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/orders', ordersRoutes);

// Keep your existing root route for API testing
app.get('/api', (req, res) => {
  res.status(200).send('hello world');
});

// Catch-all handler: send back the frontend's index.html file for any non-API routes
// This enables client-side routing to work properly
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 404 Handler for unknown API routes (this won't be reached due to catch-all above)
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Serving frontend from: ${frontendPath}`);
});

export default app;