import express from 'express';
import {
  createPaymentOrder,
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/create-payment-order', protect, createPaymentOrder);
router.post('/place-order', protect, placeOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllOrdersAdmin);
router.put('/admin/status/:id', protect, adminOnly, updateOrderStatusAdmin);

export default router;
