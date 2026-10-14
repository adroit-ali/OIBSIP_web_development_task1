import express from 'express';
import { getAllPizzas } from '../controllers/pizzaController.js';

const router = express.Router();

router.get('/', getAllPizzas);

export default router;
