const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');

require('dotenv').config();

const config = require("./config/main");
const { hashPassword, isAuth } = require("./utils/password-auth");
const User = require("./model/user.model");
const connection = require('./config/database');



/**
 * -------------- Express SETUP ----------------
 */

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * -------------- SESSION SETUP ----------------
 */

const sessionStore = MongoStore.create({
    mongoUrl: config.mongoose.url,
});

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Equals 1 day 
    }
}));

/**
 * -------------- PASSPORT SETUP ----------------
 */


app.use(passport.initialize());
app.use(passport.session());

require('./config/passport');


/**
 * -------------- ROUTES ----------------
 */

app.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: 'login-success' }));

app.get('/login-success', (req, res, next) => {
    res.send('<p>You successfully logged in. --> <a href="/dashboard-route-protected">Go to protected route</a></p>');
});

app.get('/login-failure', (req, res, next) => {
    res.send('Something Goes wrong with login fails and now you are redirected to login-failure.');
});


app.get('/dashboard-route-protected', isAuth, (req, res, next) => {
    res.send('You made it to the route.');
});

app.get('/dashboard-route', (req, res, next) => {
    res.send('Dashboard-route not protected');
});

app.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/dashboard-route');
    });


});



app.post('/register', async (req, res, next) => {
    const hash = await hashPassword(req.body.password);
    const newUser = new User({
        username: req.body.username,
        hash: hash,
    });

    newUser.save()
        .then((user) => {
            console.log(user);

            res.send('New User has been Created Successfully');
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send('Something Goes wrong');
        });

});



// Catch 404 Not Found errors and forward to error handler
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// Error handler middleware function
app.use((err, req, res, next) => {
    // Set status code and error message based on error object
    res.status(err.status || 500);
    res.send({
        error: {
            message: err.message
        }
    });
});





connection.on("connected", (err, res) => {
    console.log("mongoose is connected");
    const PORT = config.mongoose.port || 3000;
    app.listen(PORT, () => {
        console.log(`Listening to port ${PORT}`);
    });
});


