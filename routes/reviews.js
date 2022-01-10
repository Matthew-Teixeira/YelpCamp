const express = require('express');
const router = express.Router({mergeParams: true})
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { reviewSchema } = require('../schemas.js');
const campgrounds = require('./campgrounds');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if(error){ // result has an error object on it
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
}

//Reviews
router.post('/', validateReview, catchAsync( async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', "Thank you for the input")
    res.redirect(`/campgrounds/${campground._id}`)
}))

//deletes review from review db and from associated campground reviews array
router.delete('/:reviewId', catchAsync( async (req, res) => {
    const { id, reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);
    //find campground by id and pull, from the reviews array, the associated review id. 
    const camp = await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    req.flash('success', "Successfully deleted review!");
    res.redirect(`/campgrounds/${id}`); 
}))

module.exports = router;