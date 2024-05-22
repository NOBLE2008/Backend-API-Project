const express = require('express');
const {
  getAllUsers,
  signUp,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('../controller/authController');
const {
  isAuth,
  isAuthAdmin,
  restrictTo,
} = require('../middlewares/authMiddleware');

const router = express.Router();

router.get(
  '/',
  isAuth,
  isAuthAdmin,
  restrictTo(['Super Administrator']),
  getAllUsers,
);
router.post('/sign-up', signUp);
router.post('/login', login);
router.patch('/change-password', isAuth, changePassword);
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword);

module.exports = router;
