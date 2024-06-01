const express = require('express');
const { isAuth } = require('../middlewares/authMiddleware');
const { getCheckoutSession } = require('../controller/bookingController');

const router = express.Router();

router.get('/checkout-session/:tourId', isAuth, getCheckoutSession)

module.exports = router;