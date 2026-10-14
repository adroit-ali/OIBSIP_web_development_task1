import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { initEmailTransporter } from './config/emailService.js';
import { initSocket } from './socket/socketHandler.js';
import { initStockNotifierCron } from './cron/stockNotifier.js';
import { seedDatabase } from './seed/seedData.js';

import authRoutes from './routes/authRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import pizzaRoutes from './routes/pizzaRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pizzas', pizzaRoutes);

// Health check & System info
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'SliceCraft Artisan Pizza Engine',
    version: '1.0.0',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@slicecraft.com',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect DB
  await connectDB();

  // Initialize Email Transporter
  await initEmailTransporter();

  // Seed default admin, ingredients, pizzas
  await seedDatabase();

  // Initialize Cron Job
  initStockNotifierCron();

  server.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🍕 SliceCraft Full-Stack Pizza Server running on port ${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`🛡️ Admin Portal: /admin/login (admin@slicecraft.com / Admin@12345)`);
    console.log(`👤 Customer Portal: /login (customer@slicecraft.com / User@12345)`);
    console.log(`===============================================`);
  });
};

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
});
