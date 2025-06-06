import { Router } from 'express';
import {
  getAllProducers,
  getProducerPublicProfile
} from '../controllers/producer.controller';

const router = Router();

// Public producer routes (for customers to browse)
router.get('/', getAllProducers);
router.get('/:id', getProducerPublicProfile);

export default router;
