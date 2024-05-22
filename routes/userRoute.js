const express = require('express');
const {
  signUp,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('../controller/authController');

const { getAllUsers, updateEntireUser } = require('../controller/userController');
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
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.post('/update-user', isAuth, updateEntireUser)

module.exports = router;
