import express from 'express';
import { uploadImage, getUserImages } from '../controllers/imageController.js';


const router = express.Router();

router.post('/:paymentId', uploadImage);
router.get('/user/images', getUserImages);

export default router;
