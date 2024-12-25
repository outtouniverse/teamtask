const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/todo';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'your_secret_key_for_sessions',
    resave: true,
    saveUninitialized: true,
  })
);
mongoose.set('debug', true);
app.use('/uploads', express.static(path.join(__dirname, '/routes/uploads')));
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
