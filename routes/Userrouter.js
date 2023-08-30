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
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Initial Signup 
 *     tags: [Users]
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
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               message: Error message describing the issue
 */
router.route("/").post(UserController.addUser).get(AuthController.AuthenticateAdmin, UserController.getUsers).put(AuthController.AuthenticateUser, UserController.updateUser).delete(AuthController.AuthenticateUser, UserController.deleteUser)
/**
 * @swagger
 * /complete_signup/{userid}:
 *   post:
 *     summary: Complete user signup
 *     description: Complete user signup process by providing necessary information
 *     tags: [Users]
 *     parameters:
 *       - name: userid
 *         in: path
 *         description: ID of the user to complete signup
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [member, investor, partner]
 *               rc_ice:
 *                 type: string
 *                 format: binary  
 *               linkedin_link:
 *                 type: string   
 *               num_rc:
 *                 type: string    
 *             required:
 *               - role
 *           examples:
 *             member:
 *               role: member
 *               rc_ice: 'file-content-here'
 *             investor:
 *               role: investor
 *               linkedin_link: 'linkedin-profile-link-here'
 *             partner:
 *               role: partner
 *               num_rc: 'rc-number-here'
 *     responses:
 *       200:
 *         description: User signup completed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user not authorized)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /sendverify/{userid}:
 *   get:
 *     summary: Send email verification
 *     description: Send email verification link to a user by their ID
 *     tags: [Users]
 *     parameters:
 *       - name: userid
 *         in: path
 *         description: ID of the user to send verification email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.route("/sendverify/:userid").get(UserController.sendVerification);

/**
 * @swagger
 * /confirm_verification/{userid}:
 *   get:
 *     summary: Confirm email verification
 *     description: Confirm email verification for a user by their ID
 *     tags: [Users]
 *     parameters:
 *       - name: userid
 *         in: path
 *         description: ID of the user to confirm email verification
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verification confirmed successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.route("/confirm_verification/:userid").get(UserController.confirmVerification);


router.route("/UserInfo").get(AuthController.userInfo)

router.route("/User/")
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


/**
 * @swagger
 * /ApproveUser/{id}:
 *   get:
 *     summary: Approve a user
 *     description: Approve a user by their ID (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the user to approve
 *         required: true
 *         schema:
 *           type: string
 *       - name: role
 *         in: query
 *         description: Role of the user to approve (investor, member, or partner)
 *         required: true
 *         schema:
 *           type: string
 *           enum: [investor, member, partner]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User approved successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               message: Error message describing the issue
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user not authorized)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.route("/ApproveUser/:id").get(AuthController.AuthenticateAdmin, UserController.approveUser);

/**
 * @swagger
 * /RejectUser/{id}:
 *   get:
 *     summary: Reject a user
 *     description: Reject a user by their ID (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the user to reject
 *         required: true
 *         schema:
 *           type: string
 *       - name: role
 *         in: query
 *         description: Role of the user to reject (investor, member, or partner)
 *         required: true
 *         schema:
 *           type: string
 *           enum: [investor, member, partner]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User rejected successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               message: Error message describing the issue
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user not authorized)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.route("/RejectUser/:id").get(AuthController.AuthenticateAdmin, UserController.rejectUser);




module.exports=router