const express = require('express');
const { isAuth } = require('../middlewares/authMiddleware');
const { createReview, getAllReviews, updateReview, deleteReview } = require('../controller/reviewController');

const router = express.Router({ mergeParams: true });

router.get('/', isAuth, getAllReviews);
router.post('/', isAuth, createReview);
router.delete('/:reviewId', isAuth, deleteReview);
router.patch('/:id', updateReview)

module.exports = router;