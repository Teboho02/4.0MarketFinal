import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { uploadFile } from '../controllers/uploadController.js';

const router = express.Router();

// Single file (e.g., profile image)
router.post('/api/upload', authenticateToken, upload.single('file'), uploadFile);

// Multiple files (e.g., advert images)
router.post('/api/upload/advert', authenticateToken, upload.array('files', 3), uploadFile);


export default router;