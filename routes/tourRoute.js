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
} = require('../controller/toursController');
const { bestCheap } = require('../middlewares/bodyMiddleware');
const { isAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('my-tours', isAuth, myTours);
// router.param('id');

//Route for top-best-affordable tours
router.route('/top-best-cheap/').get(bestCheap, getAllTours);

router.route('/aggregate').get(aggregate);
router.route('/aggregate-monthly/:year').get(aggregateMonthly);

//Route handler for / endpoint
router.route('/').get(getAllTours).post(addNewTour);

//Route handler for /:id endpoint
router
  .route('/:id')
  .get(getTourById)
  .put(updateEntireTour)
  .delete(deleteATour)
  .patch(updateTourPartially);

//export router function
module.exports = router;
