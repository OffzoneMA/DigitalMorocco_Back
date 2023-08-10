const express = require("express")
const router = express.Router()
const AuthController = require("../controllers/AuthController")
const UserController = require("../controllers/UserController")
const UserService = require("../services/UserService")
const { AuthorizationError } = require('passport-oauth2');
const upload = require('../middelware/multer');
const {passport} = require("../config/passport-setup")

router.route("/").post(UserController.addUser).get(UserController.getUsers)
router.route("/uspdateUser").put(AuthController.AuthenticateUser,UserController.updateUser)

router.route("/complete_signup/:userid").post(UserService.checkUserVerification,upload.single('rc_ice'), UserController.complete_signup)


router.get('/auth/linkedin', passport.authenticate('linkedin'));
router.get('/auth/linkedin/callback', (req, res, next) => {
    passport.authenticate('linkedin', (err, user, info) => {
        if (err || info instanceof AuthorizationError || info?.error) {
            return res.redirect(`${process.env.FRONTEND_URL}/${info?.error != undefined ? 'failure?error=' + info?.error + '' :'failure'}`);
        }
        const auth = user?.auth;
        res.redirect(`${process.env.FRONTEND_URL}/success?auth=${auth}`);
    })(req, res, next);
});

router.get('/auth/google', passport.authenticate('google'));
router.get('/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if (err || info instanceof AuthorizationError || info?.error) {
            return res.redirect(`${process.env.FRONTEND_URL}/${info?.error != undefined ? 'failure?error=' + info?.error + '' : 'failure'}`);
        }
        const auth = user?.auth;
        res.redirect(`${process.env.FRONTEND_URL}/success?auth=${auth}`);
    })(req, res, next);
});


router.route("/sendverify/:userid").get(UserController.sendVerification)
router.route("/confirm_verification/:userid").get(UserController.confirmVerification)

router.route("/UserInfo").get(AuthController.userInfo)
router.route("/User/:id").delete(UserController.deleteUser)
router.route("/Login").post(AuthController.login)

router.route("/ApproveUser/:id").get(AuthController.AuthenticateAdmin,UserController.approveUser)
router.route("/RejectUser/:id").get(AuthController.AuthenticateAdmin, UserController.rejectUser)


module.exports=router