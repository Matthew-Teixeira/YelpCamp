const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp') 
    .then(() => {
        console.log("Mongo Connection Open")
    })
    .catch((e) => {
        console.log("Oh No, Mongo Error Dude")
        console.log(e)
    })

const sample = (arr) => {
    return arr[Math.floor(Math.random()*arr.length)]
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000)+1;
        const camp = await new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})