const fs = require('fs');
const dotenv = require('dotenv')
const dbConnect = require('../config/dbConnect');
const Tours = require('../models/tourModel');
const Users = require('../models/userModel');
const Reviews = require('../models/reviewModel');

dbConnect(process.env.DATABASE);

dotenv.config();

// Read JSON File
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'),
);


const admin = {
  name: process.env.ADMIN_NAME,
  email: process.env.ADMIN_EMAIL,
  photo: "www.defaultphoto.png",
  password: process.env.ADMIN_PASSWORD,
  confirmPassword: process.env.ADMIN_CONFIRMPASSWORD,
  role: "Admin",
  permissions: ['Super Administrator'],
}

//Delete Tours from DB
const deleteExistingTours = async () => {
  try {
    await Tours.deleteMany();
    await Users.deleteMany();
    await Reviews.deleteMany();
    console.log('All Data is sucessfully deleted from your Database');
  } catch (err) {
    console.log(err);
  }
};

//Import Tours from JSON file
const importData = async () => {
  try {
    await Tours.create(tours);
    await Users.create(admin)
    console.log("All Data is sucessfully Imported to your Database")
  } catch (err) {
    console.log(err);
  }
};

const performActions = async () => {
    await deleteExistingTours()
    await importData()
    
setTimeout(process.exit(), 6000)
}

performActions()
