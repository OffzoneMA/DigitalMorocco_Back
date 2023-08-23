const express = require("express")
const router = express.Router()
const AuthController = require("../controllers/AuthController")
const UserController = require("../controllers/UserController")
const UserService = require("../services/UserService")
const { AuthorizationError } = require('passport-oauth2');
const upload = require('../middelware/multer');
const {passport} = require("../config/passport-setup")

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user with the provided information
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - displayName
 *               - email
 *               - role
 *               - password
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               message: Error message describing the issue
 */
router.route("/").post(UserController.addUser).get(UserController.getUsers).put(AuthController.AuthenticateUser, UserController.updateUser)

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
/**
 * @swagger
 * /members?page=1:
 *   get:
 *     summary: Get user information
 *     description: Retrieve information about the authenticated user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               message: User information
 */
router.route("/UserInfo").get(AuthController.userInfo)
/**
 * @swagger
 * /User/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Delete a user by their ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the user to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.route("/User/:id").delete(UserController.deleteUser)
/**
 * @swagger
 * /Login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user and generate an authentication token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               token: JWT_Authentication_Token
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.route("/Login").post(AuthController.login);


router.route("/ApproveUser/:id").get(AuthController.AuthenticateAdmin,UserController.approveUser)
router.route("/RejectUser/:id").get(AuthController.AuthenticateAdmin, UserController.rejectUser)



module.exports=router