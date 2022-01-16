const express = require('express');
const router = express.Router()
const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage});

router.route('/')
    .get(catchAsync(campgrounds.index)) //View all camps
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)) //Post new campground
    

//Route to add form
router.get("/new", isLoggedIn, campgrounds.renderNewForm);


//Show one camp
router.get("/:id", catchAsync(campgrounds.showCampground))

//edit
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.edit))

//edit put
router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.update))

//delete
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.destroy))

module.exports = router;
