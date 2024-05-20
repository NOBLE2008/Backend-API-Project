const express = require('express');
const { getAllUsers, signUp, login, changePassword } = require('../controller/authController');
const { isAuth, isAuthAdmin, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/').get(isAuth, isAuthAdmin, restrictTo(['Super Administrator']), getAllUsers);
router.route('/sign-up').post(signUp);
router.post('/login', login)
router.route('/change-password').patch(isAuth, changePassword);

module.exports = router;
