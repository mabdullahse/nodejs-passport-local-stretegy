const passport = require('passport');


const { comparePassword } = require('../utils/password-auth');
const LocalStrategy = require('passport-local').Strategy;

const User = require("../model/user.model");


const customFields = {
    usernameField: 'username',
    passwordField: 'password'
};

const verifyCallback = (username, password, done) => {
    User.findOne({ username: username })
        .then(async (user) => {

            if (!user) { return done(null, false); }

            const isValid = await comparePassword(password, user.hash);
            if (isValid) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch((err) => {
            done(err);
        });

};

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {
    console.log(userId); 
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch(err => done(err));
});

