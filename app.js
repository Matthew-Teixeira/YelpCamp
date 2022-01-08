const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Review = require('./models/review');


mongoose.connect('mongodb://localhost:27017/yelp-camp') 
    .then(() => {
        console.log("Mongo Connection Open")
    })
    .catch((e) => {
        console.log("Oh No, Mongo Error Dude")
        console.log(e)
    })

app.engine('ejs', ejsMate); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

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

app.get("/", (req, res) => {
    res.render('home')
})

//View all camps
app.get("/campgrounds", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

//Route to add form
app.get("/campgrounds/new", (req, res) => {
    res.render('campgrounds/new')
})

//Post new campground
app.post("/campgrounds", validateCampground, catchAsync(async (req, res, next) => {
    //if(!req.body.campground) throw new ExpressError('Invalid campground data', 400) 
    //we throw the error here bc we are in catAsync(), which will hand it off to next() 
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`); 
//catch the error when we try to save, catchAsync() pushes it to our error handler at the end.
}))

//Show one camp
app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundCamp = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', { foundCamp });
}))

//edit
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundCamp = await Campground.findById(id);
    res.render('campgrounds/edit', { foundCamp });
}))

//edit put
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })//campgrounds is an object. Using spread to open it up
    res.redirect(`/campgrounds/${camp._id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

//Reviews
app.post('/campgrounds/:id/reviews', validateReview, catchAsync( async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

//deletes review from review db and from associated campground reviews array
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync( async (req, res) => {
    const { id, reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);
    //find campground by id and pull, from the reviews array, the associated review id. 
    const camp = await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    res.redirect(`/campgrounds/${id}`); 
}))

//for url we dont recognize - will respond if no matches - can use this in our below error handle
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if(!err.message) err.message = "Oh No, Error"
    res.status(statusCode).render('error', { err });//pass entire error to template
})

app.listen(3000, () => {
    console.log("Serving on port 3000");
})