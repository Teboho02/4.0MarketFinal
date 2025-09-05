// routes/advertsRoutes.js
import express from 'express';
import {getAdverts, createAdvert, getAdvertsByCategory} from '../controllers/advertsController.js';

const router = express.Router();

router.get('/adverts', getAdverts);
router.post('/adverts', createAdvert);
router.get('/adverts/category/:category', getAdvertsByCategory);



export default router;
