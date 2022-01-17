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
    for(let i = 0; i < 300; i++){
        const random1000 = Math.floor(Math.random() * 1000)+1;
        const price = Math.floor(Math.random() *20)+10;
        const camp = await new Campground({
            author: '61df76438dc6c8e5d21de483',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Good location, peaceful area, good for bringing in tents or campers of any size.',
            price: price,
            geometry: { type: 'Point', coordinates: [ cities[random1000].longitude, cities[random1000].latitude ] },
            images: [
                {
                  url: 'https://res.cloudinary.com/apollostudio/image/upload/v1642295957/YelpCamp/ld95n2y0w6xfo69yx2ju.png',
                  filename: 'YelpCamp/ld95n2y0w6xfo69yx2ju',
                },
                {
                  url: 'https://res.cloudinary.com/apollostudio/image/upload/v1642295956/YelpCamp/ryjjbyinqsayexacrzc5.jpg',
                  filename: 'YelpCamp/ryjjbyinqsayexacrzc5',
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})