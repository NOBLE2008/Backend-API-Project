const express = require('express');
const {
  getAllTours,
  getTourById,
  addNewTour,
  updateEntireTour,
  deleteATour,
  updateTourPartially,
  aggregate,
  aggregateMonthly,
  myTours,
  getToursWithin,
  distanceCheck,
  distanceCheckById,
  tourImagesUpload,
} = require('../controller/toursController');
const { bestCheap } = require('../middlewares/bodyMiddleware');
const { isAuth, isAuthAdmin } = require('../middlewares/authMiddleware');
const { tourImagesUploader } = require('../middlewares/uploadPhoto');

const router = express.Router();

router.use('/:tourId/reviews', require('./reviewRoute'));

router.post(
  '/tour-photo/:id',
  isAuth,
  isAuthAdmin,
  tourImagesUploader,
  tourImagesUpload,
);
router.get('my-tours', isAuth, myTours);
// router.param('id');

//Route for top-best-affordable tours
router.route('/top-best-cheap/').get(bestCheap, getAllTours);

router.route('/aggregate').get(aggregate);
router.route('/aggregate-monthly/:year').get(aggregateMonthly);

//Route handler for / endpoint
router.route('/').get(getAllTours).post(isAuth, isAuthAdmin, addNewTour);

router.get(
  '/get-within/distance/:distance/unit/:unit/point/:latlng',
  getToursWithin,
);
router.get(
  '/distance-check/point/:lnglat/unit/:unit/tour/:id',
  distanceCheckById,
);
router.get('/distance-check/point/:lnglat/unit/:unit', distanceCheck);
//Route handler for /:id endpoint
router
  .route('/:id')
  .get(getTourById)
  .put(isAuth, isAuthAdmin, updateEntireTour)
  .delete(isAuth, isAuthAdmin, deleteATour)
  .patch(isAuth, isAuthAdmin, updateTourPartially);

//export router function
module.exports = router;
