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

const { getAllUsers, updateEntireUser, getUserById, myInfo } = require('../controller/userController');
const {
  isAuth,
} = require('../middlewares/authMiddleware');

const router = express.Router();


router.get('/me', isAuth, myInfo)
router.get(
  '/',
  isAuth,
  getAllUsers,
);
router.get(
  '/:id',
  getUserById,
);
router.post('/sign-up', signUp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.post('/update-user', isAuth, updateEntireUser)
// eslint-disable-next-line no-unused-expressions
router.delete('/delete-user', isAuth, deleteUser)
router.patch('/change-password', isAuth, changePassword);
router.get('/get-logged-in-user', isAuth, getLoggedInUser)
router.delete('/logout-device', isAuth, logOutUser)

module.exports = router;