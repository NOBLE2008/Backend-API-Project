const express = require('express');
const { isAuth } = require('../middlewares/authMiddleware');
const { createReview, getAllReviews, updateReview, deleteReview } = require('../controller/reviewController');

const router = express.Router();

router.get('/:tourId', isAuth, getAllReviews);
router.delete('/:reviewId', isAuth, deleteReview);
router.patch('/:id', updateReview)
router.post('/:tourId', isAuth, createReview);

module.exports = router;