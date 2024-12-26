const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/user');
const Task = require('../models/tasks');
const MongoStore = require('connect-mongo');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const router = express.Router();

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');




cloudinary.config({
  cloud_name: 'diqiftvua',      
  api_key: '161139739143645',           
  api_secret: 'cKMBlVREkN2uws65X8K0x85aino',     
});


async function connectDB() {
  try {
    await mongoose.connect(
      'mongodb+srv://ak:pass@cluster0.lbxdz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    );
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

connectDB();

// Display signup form
router.get('/signup', (req, res) => {
  res.render('signup'); 
});
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const startTime = Date.now();

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 8); // Reduced bcrypt rounds
    const newUser = new User({ username, password: hashedPassword });

    await newUser.save();

    const endTime = Date.now();
    console.log('Signup process completed in', endTime - startTime, 'ms');

    req.session.username = newUser.username;
    res.redirect('/users/dashboard');
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Display login form
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render('login', { error: 'Invalid username or password' });
    }

    // Store the username in the session
    req.session.username = user.username;

    // Redirect to the dashboard after successful login
    res.redirect('/users/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/dashboard', async (req, res) => {
  try {
    // Retrieve the username from the session
    const username = req.session.username;

    // Find the user in the database
    const currentUser = await User.findOne({ username });

    if (!currentUser) {
      return res.status(401).send('Unauthorized');
    }

    // Fetch user's uploaded tasks from the database
    const userTasks = await Task.find({ _id: { $in: currentUser.uploadedTasks } });

    // Retrieve and clear the message from the session
    const message = req.session.message;
    delete req.session.message;

    // Render the dashboard view with the username, tasks, and message
    res.render('dashboard', { username, userTasks, message });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/users/login');
  });
});
// Add this route to display all members in teamview
router.get('/teamview', async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();
    
    res.render('teamview', { users });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
//const storage = multer.diskStorage({
 // destination: function (req, file, cb) {
   // const uploadPath = path.join(__dirname, 'uploads/');
 //   cb(null, uploadPath);
 // },
 // filename: function (req, file, cb) {
 //   cb(null, file.originalname);
 // },
//});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // The folder in your Cloudinary account where files will be stored
    allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed file formats
    public_id: (req, file) => file.originalname.split('.')[0], // File name in Cloudinary
  },
});
const upload = multer({ storage: storage }); 
router.post('/uploadTask', upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const currentUser = await User.findOne({ username: req.session.username });

    if (!currentUser) {
      return res.status(401).send('Unauthorized');
    }

   
    const newTask = new Task({
      image: req.file.path,
      title,
      description,
    });

    await newTask.save();

   currentUser.uploadedTasks.push(newTask);
    await currentUser.save();

   
    req.session.message = 'Task uploaded successfully';

    // Redirect to the dashboard
    res.redirect('/users/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/teamtask', async (req, res) => {
  try {
    const allTasks = await Task.find().populate('uploadedBy', 'username').sort({ timestamp: -1 });
    res.render('teamtask', { allTasks });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
