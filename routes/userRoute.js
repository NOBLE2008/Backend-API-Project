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

const { getAllUsers, updateEntireUser, getUserById, myInfo, photoUpload, getMyPhoto, getPhotoById, addTourToCart } = require('../controller/userController');
const {
  isAuth,
} = require('../middlewares/authMiddleware');
const { photoUploader } = require('../middlewares/uploadPhoto');

const router = express.Router();
//Fixed bug in myPhoto handler by adding the isAuth middleware
router.get('/photo/:id', getPhotoById)
router.get('/myPhoto', isAuth, getMyPhoto)
router.get('/me', isAuth, myInfo)
router.get(
  '/',
  getAllUsers,
);
router.get(
  '/:id',
  getUserById,
);
router.post('/photo', isAuth, photoUploader, photoUpload)
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