const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); 
const {generateAccessToken} = require('../services/AuthService'); 



passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/users/auth/google/callback',
            scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const existingUser = await User.findOne({ googleId: profile.id }) ;
                if (existingUser) {
                    const token = await generateAccessToken(existingUser)
                    return done(null, { user: existingUser, auth: token });
                }
                const existingEmail = await User.findOne({ email: profile.emails[0].value })
                if (existingEmail){
                    throw new Error('An account already exists with this email')
                }
                

                const newUser = await User.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    displayName: profile.displayName, 
                    status: 'verified'

                });

               const token = await generateAccessToken(newUser)
                return done(null, { user: newUser, auth: token });
            } catch (error) {
                const errorMessage = error.message;
                return done(null, false, { error: errorMessage });
            }
        }
    )
);
passport.use(
    new LinkedInStrategy(
        {
            clientID: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            callbackURL: '/users/auth/linkedin/callback',
            scope: ['r_liteprofile', 'r_emailaddress'], 
            state: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
             
             
                const existingUser = await User.findOne({ linkedinId: profile.id }) ;

                if (existingUser) {
                    const token = await generateAccessToken(existingUser)
                    return done(null, { user: existingUser, auth: token });
                }


                const existingEmail = await User.findOne({ email: profile.emails[0].value })
                if (existingEmail) {
                    throw new Error('An account already exists with this email')
                }


                const newUser = await User.create({
                    linkedinId: profile.id,
                    email: profile.emails[0].value,
                    displayName: profile.displayName,
                    status: 'verified'

                });

                const token = await generateAccessToken(newUser)
                return done(null, { user: newUser, auth: token });
            } catch (error) {
                const errorMessage = error.message;
                return done(null, false, { error: errorMessage });
            }
        }
    )
);



passport.serializeUser((user, done) => {
    done(null, user.user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = {passport};