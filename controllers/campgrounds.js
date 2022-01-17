const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary/index");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
     const camp = new Campground(req.body.campground);
     camp.geometry = geoData.body.features[0].geometry;
     camp.images = req.files.map(f => ({ url: f.path, filename: f.filename })); //will make an array of these objects through Multer added array of req.files
     //associating the new campground we created with the logged in user - req.user is there thanks to passport
     camp.author = req.user._id; //Take that user id and save it as the author
     await camp.save();
     console.log(camp);
     req.flash('success', "Successfully made a new campground!")
     res.redirect(`/campgrounds/${camp._id}`); 
//catch the error when we try to save, catchAsync() pushes it to our error handler at the end.
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;                          //pop all reviews from reviews array on the one camp we find then pop on each review, thier author. 
    const campground = await Campground.findById(id).populate({ 
        path: 'reviews',
        populate: {
            path: 'author'
        } 
    }).populate('author');
    if(!campground){
        req.flash('error', "Cannot find campground")
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.edit = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', "Cannot find campground")
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.update = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });//campgrounds is an object. Using spread to open it up
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.images.push(...images);
    await camp.save();
    if(req.body.deletImages){
        for(let filename of req.body.deletImages){
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deletImages } } } })
        console.log(camp);
    }
    req.flash('success', "Successfully updated campground!")
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.destroy = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted campground!")
    res.redirect('/campgrounds');
}