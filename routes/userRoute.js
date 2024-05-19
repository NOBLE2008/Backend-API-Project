const express = require('express');
const { getAllUsers, signUp, login } = require('../controller/authController');
const { isAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/').get(isAuth, getAllUsers);
router.route('/sign-up').post(signUp);
router.route('/login').post();

module.exports = router;
