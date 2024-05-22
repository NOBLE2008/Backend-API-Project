const express = require('express');
const {
  getAllUsers,
  signUp,
  login,
  changePassword,
  forgotPassword,
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
<<<<<<< HEAD
router.post('/forgot-password', forgotPassword);
=======
>>>>>>> 62c2e4c180b1a16d004142496027d2b9e0c206cf

module.exports = router;
