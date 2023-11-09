import express from 'express';

import seedData from '../controllers/seedData.js';

const router = express.Router();

router.get('/', seedData);

export default router;