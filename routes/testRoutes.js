import express from 'express';
import { testApi } from '../controllers/testController.js';

const router = express.Router();
router.get('/api/test', testApi);

export default router;