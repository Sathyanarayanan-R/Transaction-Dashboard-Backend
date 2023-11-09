import express from 'express';

import { getProductsBySearchAndPagination, getMonthlySalesStatistics, getMonthlyPriceRange, getMonthlyCategories, getAll3APIData } from '../controllers/products.js';

const router = express.Router();

router.get('/search/:month', getProductsBySearchAndPagination);
router.get('/monthlysale/:month', getMonthlySalesStatistics);
router.get('/monthlypricerange/:month', getMonthlyPriceRange);
router.get('/monthlycategories/:month', getMonthlyCategories);
router.get('/getAll3APIData/:month', getAll3APIData);

export default router;