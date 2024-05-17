const express = require("express")
const router = express.Router()
const AuthController = require("../controllers/AuthController")
const UserController = require("../controllers/UserController")
const UserService = require("../services/UserService")
const { AuthorizationError } = require('passport-oauth2');
const upload = require('../middelware/multer');
const { passport } = require("../config/passport-setup")

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
 *     description: Delete a user 
 *     tags: [Users]
 *     responses:
 *       204:
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
 *       201:
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
 * /users/complete_signup/{userid}:
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

router.route("/complete_signup/:userid").post(UserService.checkUserVerification, upload.single('rc_ice'), UserController.complete_signup)

/**
 * @swagger
 *   /users/AllUsers:
 *     get:
 *       summary: Get all users
 *       description: Retrieve a list of users
 *       tags: [Users]
 *       responses:
 *         200:
 *           description: Successful response
 *           content:
 *              application/json:
 *                  example: { users: [ ] }
 *         500:
 *           description: Internal server error
 */
router.route("/AllUsers").get(AuthController.AllUsers)


router.get('/auth/linkedin', passport.authenticate('linkedin'));
router.get('/auth/linkedin/callback', (req, res, next) => {
    passport.authenticate('linkedin', (err, user, info) => {
        if (err || info instanceof AuthorizationError || info?.error) {
            return res.redirect(`${process.env.FRONTEND_URL}/${info?.error != undefined ? 'SignIn?error=' + info?.error + '' : 'SignIn'}`);
        }
        const auth = user?.auth;

        const userRole = user?.user?.role;

        const socialId = user?.socialId;

        if (userRole) {
            res.redirect(`${process.env.FRONTEND_URL}/Dashboard?auth=${auth}&socialId=${socialId}`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/ChooseRole?auth=${auth}&socialId=${socialId}`);
        }
    })(req, res, next);
});

router.get('/auth/google', passport.authenticate('google'));
router.get('/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if (err || info instanceof AuthorizationError || info?.error) {
            return res.redirect(`${process.env.FRONTEND_URL}/${info?.error != undefined ? 'SignIn?error=' + info?.error + '' : 'SignIn'}`);
        }
        const auth = user?.auth;
        const userRole = user?.user?.role;

        const socialId = user?.socialId;

        if (userRole) {
            res.redirect(`${process.env.FRONTEND_URL}/Dashboard?auth=${auth}&socialId=${socialId}`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/ChooseRole?auth=${auth}&socialId=${socialId}`);
        }
    })(req, res, next);
});

router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback', (req, res, next) => {
    passport.authenticate('facebook', (err, user, info) => {
        if (err || info instanceof AuthorizationError || info?.error) {
            return res.redirect(`${process.env.FRONTEND_URL}/${info?.error != undefined ? 'SignIn?error=' + info?.error + '' : 'SignIn'}`);
        }
        const auth = user?.auth;
        const userRole = user?.user?.role;

        const socialId = user?.socialId;

        if (userRole) {
            res.redirect(`${process.env.FRONTEND_URL}/Dashboard?auth=${auth}&socialId=${socialId}`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/ChooseRole?auth=${auth}&socialId=${socialId}`);
        }
    })(req, res, next);
});

/**
 * @swagger
 * /users/sendverify/{userid}:
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
 * /users/forgot-password:
 *   post:
 *     summary: Request to send forgot password email
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
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.route("/forgot-password").post(UserController.sendForgotPassword);

/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Bad Request - Passwords do not match
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.route("/reset-password").post(UserController.resetPassword);

/**
 * @swagger
 * /users/confirm_verification/{userid}:
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

/**
 * @swagger
 * /users/Login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user and generate an authentication token
 *     tags: [Authentication]
 *     security:
 *       - jwtToken : []
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
 * /users/ApproveUser/{id}:
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
 * /users/RejectUser/{id}:
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

/**
 * @swagger
 * /users/update:
 *   put:
 *     summary: Update user account details.
 *     description: Update the account details of the authenticated user.
 *     tags: [Users]
 *     security:
 *       - jwtToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The first name of the user.
 *               lastName:
 *                 type: string
 *                 description: The last name of the user.
 *               phoneNumber:
 *                 type: string
 *                 description: The phone number of the user.
 *               website:
 *                 type: string
 *                 description: The website URL of the user.
 *               address:
 *                 type: string
 *                 description: The address of the user.
 *               Country:
 *                 type: string
 *                 description: The country of the user.
 *               cityState:
 *                 type: string
 *                 description: The city and state of the user.
 *               region:
 *                 type: string
 *                 description: The region of the user.
 *               image:
 *                 type: string
 *                 description: The image URL of the user.
 *               displayName:
 *                 type: string
 *                 description: The display name of the user.
 *               email:
 *                 type: string
 *                 description: The email address of the user.
 *               role:
 *                 type: string
 *                 enum: ['Admin', 'partner', 'investor', 'member' , 'associate']
 *                 description: The role of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *               status:
 *                 type: string
 *                 enum: ['accepted', 'pending', 'rejected', 'notVerified', 'verified']
 *                 description: The status of the user.
 *               language:
 *                 type: string
 *                 description: The language preference of the user.
 *     responses:
 *       200:
 *         description: User account updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the updated user.
 *                 firstName:
 *                   type: string
 *                   description: The first name of the user.
 *                 lastName:
 *                   type: string
 *                   description: The last name of the user.
 *                 role:
 *                   type: string
 *                   description: The role of the user.
 *       500:
 *         description: Internal server error.
 */
router.put('/update',AuthController.AuthenticateUser, UserController.updateUser);

/**
 * @swagger
 * /users/{email}:
 *   get:
 *     summary: Recherche un utilisateur par son adresse e-mail.
 *     description: Recherche un utilisateur dans la base de données en utilisant son adresse e-mail.
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         description: L'adresse e-mail de l'utilisateur à rechercher.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Utilisateur trouvé.
 *       '404':
 *         description: Aucun utilisateur trouvé avec cette adresse e-mail.
 *       '500':
 *         description: Erreur interne du serveur lors de la recherche de l'utilisateur.
 */
router.get('/:email', UserController.getUserByEmail);


/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Supprime un utilisateur.
 *     description: Supprime un utilisateur en fonction de son identifiant.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Identifiant de l'utilisateur à supprimer.
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Utilisateur supprimé avec succès.
 *       '404':
 *         description: Utilisateur non trouvé.
 *       '500':
 *         description: Erreur interne du serveur.
 */
router.delete('/:userId', UserController.deleteOneUser )

/**
 * @swagger
 * /users/updateFullName:
 *   post:
 *     summary: Update user's full name
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: The new full name of the user
 *               socialId:
 *                 type: string
 *                 description: The social ID of the user
 *               socialType:
 *                 type: string
 *                 description: The social type (e.g., 'google', 'linkedin', 'facebook')
 *     responses:
 *       200:
 *         description: Full name updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/updateFullName', UserController.updateFullName);

module.exports = router