const express = require('express');
const router = express.Router()
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

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
    //associating the new campground we created with the logged in user - req.user is there thanks to passport
    camp.author = req.user._id; //Take that user id and save it as the author
    await camp.save();
    req.flash('success', "Successfully made a new campground!")
    res.redirect(`/campgrounds/${camp._id}`); 
//catch the error when we try to save, catchAsync() pushes it to our error handler at the end.
}))

//Show one camp
router.get("/:id", catchAsync(async (req, res) => {
    const { id } = req.params;                          //pop all reviews from reviews array on the one camp we find then pop on each review, thier author. 
    const campground = await Campground.findById(id).populate({ 
        path: 'reviews',
        populate: {
            path: 'author'
        } 
    }).populate('author');
    console.log(campground);
    if(!campground){
        req.flash('error', "Cannot find campground")
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}))

//edit
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', "Cannot find campground")
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))

//edit put
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })//campgrounds is an object. Using spread to open it up
    req.flash('success', "Successfully updated campground!")
    res.redirect(`/campgrounds/${camp._id}`);
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted campground!")
    res.redirect('/campgrounds');
}))

module.exports = router;
