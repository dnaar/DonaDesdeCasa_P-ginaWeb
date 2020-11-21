const fetch = require('node-fetch');
const LocalStrategy = require('passport-local').Strategy;

function initialize(passport) {
    const verifyUser = async(username, password, done) => {
        var user;
        try {
            const response = await fetch(`http://localhost/user_login/${username}/${password}`);
            user = await response.json();
            user = user[0];
        } catch (e) {
            user = [];
        }
        try {
            if (user.length == 0) {
                return done(null, false, { message: 'Invalid username or password' });
            } else {
                return done(null, user);
            }
        } catch (e) {
            return done(null, false, { message: 'Invalid username or password' });
        }
    };

    passport.use(new LocalStrategy({ usernameField: 'username' }, verifyUser));
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));
}

module.exports = initialize;