const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/tasks');
const multer = require('multer');
const path = require('path');
const router = express.Router();
mongoose.connect('mongodb://localhost:27017/todo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
// Display signup form
router.get('/signup', (req, res) => {
  res.render('signup'); // Assuming you have a 'signup' view/template
});
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();
    req.session.username = newUser.username;
    res.redirect('/users/dashboard'); 
  } catch (error) {
    console.error(error); // Log the error to the console
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

    // If the user doesn't exist or the password is incorrect, show an error
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
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads/');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
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

    // Create a new task
    const newTask = new Task({
      image: req.file.filename,
      title,
      description,
    });

    // Save the task to the database
    await newTask.save();

    // Associate the task with the current user
    currentUser.uploadedTasks.push(newTask);
    await currentUser.save();

    // Set a success message in the session
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
