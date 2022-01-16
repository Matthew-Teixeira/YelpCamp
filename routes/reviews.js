const express = require('express');
const router = express.Router({mergeParams: true})
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');


//Reviews
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.creatReview))

//deletes review from review db and from associated campground reviews array
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.destroy))

module.exports = router;