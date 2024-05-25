const express = require('express');
const { isAuth } = require('../middlewares/authMiddleware');
const { createReview, getAllReviews } = require('../controller/reviewController');

const router = express.Router();

router.get('/:tourId', getAllReviews);
router.post('/:tourId', isAuth, createReview);

module.exports = router;