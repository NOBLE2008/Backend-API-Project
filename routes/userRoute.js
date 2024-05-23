const express = require('express');
const {
  signUp,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  deleteUser,
  logOutUser,
  getLoggedInUser,
} = require('../controller/authController');

const { getAllUsers, updateEntireUser } = require('../controller/userController');
const {
  isAuth,
} = require('../middlewares/authMiddleware');

const router = express.Router();

router.get(
  '/',
  isAuth,
  getAllUsers,
);
router.post('/sign-up', signUp);
router.post('/login', login);
router.patch('/change-password', isAuth, changePassword);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.post('/update-user', isAuth, updateEntireUser)
// eslint-disable-next-line no-unused-expressions
router.delete('/delete-user', isAuth, deleteUser)
router.get('/get-logged-in-user', isAuth, getLoggedInUser)
router.delete('/logout-device', isAuth, logOutUser)

module.exports = router;