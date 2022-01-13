const express = require('express');
const router = express.Router()
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema} = require('../schemas.js');
const {isLoggedIn} = require('../middleware');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if(error){ // result has an error object on it
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
}

//View all camps
router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

//Route to add form
router.get("/new", isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
})

//Post new campground
router.post("/", isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    //if(!req.body.campground) throw new ExpressError('Invalid campground data', 400) 
    //we throw the error here bc we are in catAsync(), which will hand it off to next() 
    const camp = new Campground(req.body.campground);
    await camp.save();
    req.flash('success', "Successfully made a new campground!")
    res.redirect(`/campgrounds/${camp._id}`); 
//catch the error when we try to save, catchAsync() pushes it to our error handler at the end.
}))

//Show one camp
router.get("/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundCamp = await Campground.findById(id).populate('reviews');
    if(!foundCamp){
        req.flash('error', "Cannot find campground")
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { foundCamp });
}))

//edit
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundCamp = await Campground.findById(id);
    if(!foundCamp){
        req.flash('error', "Cannot find campground")
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { foundCamp });
}))

//edit put
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })//campgrounds is an object. Using spread to open it up
    req.flash('success', "Successfully updated campground!")
    res.redirect(`/campgrounds/${camp._id}`);
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted campground!")
    res.redirect('/campgrounds');
}))

module.exports = router;
