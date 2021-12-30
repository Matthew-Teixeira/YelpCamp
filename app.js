const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');

mongoose.connect('mongodb://localhost:27017/yelp-camp') 
    .then(() => {
        console.log("Mongo Connection Open")
    })
    .catch((e) => {
        console.log("Oh No, Mongo Error Dude")
        console.log(e)
    })

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get("/", (req, res) => {
    res.render('home')
})

//View all camps
app.get("/campgrounds", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
})

//Route to add form
app.get("/campgrounds/new", (req, res) => {
    res.render('campgrounds/new')
})

//Post new campground
app.post("/campgrounds", async (req, res) => {
   const camp = new Campground(req.body.campground);
   await camp.save();
   res.redirect(`/campgrounds/${camp._id}`);
})

//Show one camp
app.get("/campgrounds/:id", async (req, res) => {
    const { id } = req.params;
    const foundCamp = await Campground.findById(id);
    res.render('campgrounds/show', { foundCamp });
})

//edit
app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params;
    const foundCamp = await Campground.findById(id);
    res.render('campgrounds/edit', { foundCamp });
})

//edit put
app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })//campgrounds is an object. Using spread to open it up
    res.redirect(`/campgrounds/${camp._id}`);
})

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.listen(3000, () => {
    console.log("Serving on port 3000");
})