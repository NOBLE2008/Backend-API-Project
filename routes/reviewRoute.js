const express = require('express');
const { isAuth } = require('../middlewares/authMiddleware');
const { createReview } = require('../controller/reviewController');

const router = express.Router();

router.post('/:tourId', isAuth, createReview);

module.exports = router;