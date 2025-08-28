const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const AuthService = require('../services/AuthService');
const MemberService = require('../services/MemberService');
const PartnerService = require('../services/PartnerService');
const InvestorService = require('../services/InvestorService');
const ProjectService = require('../services/ProjectService');
const EventService = require('../services/EventService');
const { generateAccessToken } = require('../services/AuthService');
const UserLogService = require('../services/UserLogService');

const generateUserInfos = async (user) => {

    const accessToken = await generateAccessToken(user);

    let data = null;
    let projectCount = 0;
    let eventCount = 0;

    // Vérifier si user et role existent avant de faire le toLowerCase()
    const userRole = user?.role?.toLowerCase();

    if (userRole) {
        if (userRole === "member") {
            let member = await MemberService.getMemberByUserId(user._id);

            if (member?._id) {
                projectCount = await ProjectService.countProjectsByMemberId(member._id);
                data = {
                    ...(member._doc || member),
                    projectCount
                };
            }
        }
        else if (userRole === "partner") {
            let partner = await PartnerService.getPartnerByUserId(user._id);
            data = partner?._doc || partner;
        }
        else if (userRole === "investor") {
            let investor = await InvestorService.getInvestorByUserId(user._id);
            data = investor?._doc || investor;
        }
    }

    eventCount = await EventService.countEventsByUserId(user?._id);

    // Simplifier la logique de construction du résultat
    const baseUser = user?._doc || user;
    const result = {
        ...baseUser,
        eventCount
    };

    // N'ajouter les données spécifiques au rôle que si elles existent
    if (userRole && data) {
        result[userRole] = data;
    }

    await UserLogService.createUserLog('Generate user info', user?._id);

    return {
        accessToken,
        user: result
    };
}

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
                const existingUser = await User.findOne({ googleId: profile.id });
                if (existingUser) {
                    const result = await generateUserInfos(existingUser)
                    const log = await UserLogService.createUserLog('Account Signin', existingUser._id);
                    return done(null, { user: result.user, auth: result.accessToken, socialId: profile.id, provider: 'google' });
                }
                const existingEmail = await User.findOne({ email: profile.emails[0].value })
                if (existingEmail) {
                    throw new Error('An account already exists with this email')
                }

                const newUser = await User.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    displayName: profile.displayName,
                    status: 'verified'

                });

                const result = await generateUserInfos(newUser)
                const log = await UserLogService.createUserLog('Account Initial Signup', newUser._id);
                const log2 = await UserLogService.createUserLog('Verified', newUser._id);
                return done(null, { user: result.user, auth: result.accessToken, socialId: profile.id, provider: 'google' });
            } catch (error) {
                const errorMessage = error.message;
                return done(null, false, { error: errorMessage });
            }
        }
    )
);

passport.use('google-signup',
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/users/auth/google/signup/callback`,
            scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const existingEmail = await User.findOne({ email: profile.emails[0].value });
                if (existingEmail) {
                    throw new Error('An account already exists with this email');
                }
                const newUser = await User.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    displayName: profile.displayName,
                    status: 'verified',
                    image: profile.photos?.[0]?.value
                });

                const result = await generateUserInfos(newUser);
                await UserLogService.createUserLog('Account Initial Signup', newUser._id);
                await UserLogService.createUserLog('Verified', newUser._id);

                return done(null, { user: result.user, auth: result.accessToken, socialId: profile.id, provider: 'google' });
            } catch (error) {
                return done(null, false, { error: error.message });
            }
        }
    )
);

passport.use('google-signin',
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/users/auth/google/signin/callback`,
            scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const existingUser = await User.findOne({ googleId: profile.id });

                if (existingUser) {
                    const result = await generateUserInfos(existingUser);
                    await UserLogService.createUserLog('Account Signin', existingUser._id);
                    return done(null, { user: result.user, auth: result.accessToken, socialId: profile.id, provider: 'google' });
                }

                const existingEmail = await User.findOne({ email: profile.emails[0].value });
                if (!existingEmail) {
                    throw new Error('No account exists with this email');
                }

                return done(null, false, { error: 'This account is not registered using this Social network' });
            } catch (error) {
                return done(null, false, { error: error.message });
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
            state: false,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {


                const existingUser = await User.findOne({ linkedinId: profile.id });

                if (existingUser) {
                    const result = await generateUserInfos(existingUser)
                    const log = await UserLogService.createUserLog('Account Signin', existingUser._id);
                    return done(null, { user: result.user, auth: result.accessToken, socialId: profile.id, provider: 'linkedin' });
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

                const result = await AuthService.generateUserInfos(newUser)
                const log = await UserLogService.createUserLog('Account Initial Signup', newUser._id);
                const log2 = await UserLogService.createUserLog('Verified', newUser._id);
                return done(null, { user: result.user, auth: result.accessToken, socialId: profile.id, provider: 'linkedin' });
            } catch (error) {
                const errorMessage = error.message;
                return done(null, false, { error: errorMessage });
            }
        }
    )
);

passport.use('linkedin-signup',
    new LinkedInStrategy(
        {
            clientID: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/users/auth/linkedin/signup/callback`,
            userProfileURL: 'https://api.linkedin.com/v2/userinfo',
            scope: ['email', 'profile', 'openid'],
            state: false,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const existingEmail = await User.findOne({ email: profile.email });
                if (existingEmail) {
                    throw new Error('An account already exists with this email');
                }

                const newUser = await User.create({
                    linkedinId: profile.id,
                    email: profile.email,
                    displayName: profile.displayName,
                    image: profile.picture,
                    status: 'verified'
                });

                await UserLogService.createUserLog('Account SignUp LinkedIn 0', newUser._id);

                const result = await generateUserInfos(newUser);

                //Verify result structure
                if (!result || !result.accessToken) {
                    console.log('Failed to generate user information and access token');
                    await UserLogService.createUserLog('Failed to generate user information LinkedIn SignUp', newUser._id);
                }

                await UserLogService.createUserLog('Account Initial Signup LinkedIn', newUser._id);
                await UserLogService.createUserLog('Verified', newUser._id);

                return done(null, { user: result.user, auth: result.accessToken, socialId: profile.id, provider: 'linkedin' });
            } catch (error) {
                return done(null, false, { error: error.message });
            }
        }
    )
);

passport.use('linkedin-signin',
    new LinkedInStrategy(
        {
            clientID: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/users/auth/linkedin/signin/callback`,
            userProfileURL: 'https://api.linkedin.com/v2/userinfo',
            scope: ['email', 'profile', 'openid'],
            state: false,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Extract email properly from LinkedIn response
                const email = profile.emails?.[0]?.value || profile.email;

                if (!email) {
                    console.error('No email found in LinkedIn profile');
                    return done(null, false, { error: 'No email found in LinkedIn profile' });
                }

                const existingUser = await User.findOne({ linkedinId: profile.id });

                if (existingUser) {
                    await UserLogService.createUserLog('Account Signin LinkedIn', existingUser._id);

                    try {
                        const result = await generateUserInfos(existingUser);

                        // Validate the result before returning
                        if (!result || !result.accessToken) {
                            return done(null, false, { error: 'Failed to generate authentication token' });
                        }

                        const returnObject = {
                            user: result.user,
                            auth: result.accessToken,
                            socialId: profile.id,
                            provider: 'linkedin'
                        };


                        return done(null, returnObject);
                    } catch (genError) {
                        console.error('Error generating user info:', genError);
                        return done(null, false, { error: 'Failed to generate user information' });
                    }
                }

                // Check if user exists with this email
                const existingEmail = await User.findOne({ email });
                if (existingEmail) {
                    console.log('Found user with matching email but not LinkedIn ID');
                    return done(null, false, { error: 'This account is not registered using this Social network' });
                } else {
                    console.log('No account found with this email');
                    return done(null, false, { error: 'No account exists with this email' });
                }
            } catch (error) {
                console.error('LinkedIn authentication error:', error);
                return done(error);
            }
        }
    )
);


passport.use(
    new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: '/users/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'emails'],
    },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                const existingUser = await User.findOne({ facebookId: profile.id });

                if (existingUser) {
                    const result = await generateUserInfos(existingUser)
                    const log = await UserLogService.createUserLog('Account Signin', existingUser._id);
                    return cb(null, { user: result.user, auth: result.accessToken, socialId: profile.id, provider: 'facebook' });
                }

                const existingEmail = await User.findOne({ email: profile.emails[0].value })
                if (existingEmail) {
                    throw new Error('An account already exists with this email')
                }

                const newUser = await User.create({
                    facebookId: profile.id,
                    email: profile.emails[0].value,
                    displayName: profile.displayName,
                    status: 'verified'

                });

                const result = await generateUserInfos(newUser)
                const log = await UserLogService.createUserLog('Account Initial Signup', newUser._id);
                const log2 = await UserLogService.createUserLog('Verified', newUser._id);
                return cb(null, { user: result.user, auth: result.accessToken, socialId: profile.id, provider: 'facebook' });
            } catch (error) {
                console.log(error)
            }
        }
    )
);


passport.use('facebook-signup',
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/users/auth/facebook/signup/callback`,
            profileFields: ['id', 'displayName', 'emails'],
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                const existingEmail = await User.findOne({ email: profile.emails[0].value });
                if (existingEmail) {
                    throw new Error('An account already exists with this email');
                }

                const newUser = await User.create({
                    facebookId: profile.id,
                    email: profile.emails[0].value,
                    displayName: profile.displayName,
                    status: 'verified'
                });

                const result = await generateUserInfos(newUser);
                await UserLogService.createUserLog('Account Initial Signup', newUser._id);
                await UserLogService.createUserLog('Verified', newUser._id);

                return cb(null, { user: result.user, auth: result.accessToken, socialId: profile.id, provider: 'facebook' });
            } catch (error) {
                return cb(null, false, { error: error.message });
            }
        }
    )
);

passport.use('facebook-signin',
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/users/auth/facebook/signin/callback`,
            profileFields: ['id', 'displayName', 'emails'],
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                const existingUser = await User.findOne({ facebookId: profile.id });

                if (existingUser) {
                    const result = await generateUserInfos(existingUser);
                    await UserLogService.createUserLog('Account Signin', existingUser._id);
                    return cb(null, { user: result.user, auth: result.accessToken, socialId: profile.id, provider: 'facebook' });
                }

                const existingEmail = await User.findOne({ email: profile.emails[0].value });
                if (!existingEmail) {
                    throw new Error('No account exists with this email');
                }

                return done(null, false, { error: 'This account is not registered using this Social network' });
            } catch (error) {
                return cb(null, false, { error: error.message });
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

module.exports = { passport };
