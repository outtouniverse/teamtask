const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const app = express();

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary');


cloudinary.config({
  cloud_name: 'diqiftvua',      
  api_key: '161139739143645',           
  api_secret: 'cKMBlVREkN2uws65X8K0x85aino',     
});


// MongoDB connection
const mongoURI = 'mongodb+srv://ak:pass@cluster0.lbxdz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI);
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoURI, 
      collectionName: 'sessions', 
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, 
  })
);
mongoose.set('debug', true);
//app.use('/uploads', express.static(path.join(__dirname, '/routes/uploads')));
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Cloudinary folder name where images will be stored
    allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed file types
  },
});
// Routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');


app.use('/', indexRouter);
app.use('/users', usersRouter);



// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
