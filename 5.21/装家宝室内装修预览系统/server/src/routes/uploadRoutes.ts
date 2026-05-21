import { Router } from 'express';
import { upload } from '../config/upload';
import { uploadFloorPlan } from '../controllers/uploadController';

const router = Router();

router.post('/floorplan', upload.single('file'), uploadFloorPlan);

export default router;
