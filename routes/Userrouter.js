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
 *               language:
 *                 type: string
 *                 description: The language of the user
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

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Récupère la liste des utilisateurs avec pagination et filtrage
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de la page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'utilisateurs par page
 *       - in: query
 *         name: roles
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filtrer par rôle
 *       - in: query
 *         name: statuses
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *       500:
 *         description: Erreur serveur
 */
router.get('/all', UserController.getAllUsers);

/**
 * @swagger
 * /users/ById/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: The user description by ID
 *       404:
 *         description: The user was not found
 *       500:
 *         description: Some server error
 */
router.get('/ById/:id', UserController.getUserByID);

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
            res.redirect(`${process.env.FRONTEND_URL}/Success?auth=${auth}`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/SuccessSignUp?auth=${auth}`);
        }
    })(req, res, next);
});

//Linkedin SignUp
router.get('/auth/linkedin/signup', passport.authenticate('linkedin-signup'));
router.get('/auth/linkedin/signup/callback', (req, res, next) => {
    passport.authenticate('linkedin-signup', (err, user, info) => {
        if (err || info instanceof AuthorizationError || info?.error) {
            return res.redirect(`${process.env.FRONTEND_URL}/${info?.error != undefined ? 'SignUp?error=' + info?.error + '' : 'SignUp'}`);
        }
        const auth = user?.auth;

        const userRole = user?.user?.role;

        const socialId = user?.socialId;

        if (userRole) {
            res.redirect(`${process.env.FRONTEND_URL}/Success?auth=${auth}`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/SuccessSignUp?auth=${auth}`);
        }
    })(req, res, next);
});

//LinkedIn SignIn
router.get('/auth/linkedin/signin', passport.authenticate('linkedin-signin'));
router.get('/auth/linkedin/signin/callback', (req, res, next) => {
    passport.authenticate('linkedin-signin', (err, user, info) => {
        if (err || info instanceof AuthorizationError || info?.error) {
            return res.redirect(`${process.env.FRONTEND_URL}/${info?.error != undefined ? 'SignIn?error=' + info?.error + '' : 'SignIn'}`);
        }
        const auth = user?.auth;

        const userRole = user?.user?.role;

        const socialId = user?.socialId;

        if (userRole) {
            res.redirect(`${process.env.FRONTEND_URL}/Success?auth=${auth}`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/SuccessSignUp?auth=${auth}`);
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
            res.redirect(`${process.env.FRONTEND_URL}/Success?auth=${auth}`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/SuccessSignUp?auth=${auth}`);
        }
    })(req, res, next);
});

// Google SignUp
router.get('/auth/google/signup', passport.authenticate('google-signup'));
router.get('/auth/google/signup/callback', (req, res, next) => {
    passport.authenticate('google-signup', (err, user, info) => {
        if (err || info instanceof AuthorizationError || info?.error) {
            return res.redirect(`${process.env.FRONTEND_URL}/${info?.error != undefined ? 'SignUp?error=' + info?.error + '' : 'SignUp'}`);
        }
        const auth = user?.auth;

        const userRole = user?.user?.role;

        const socialId = user?.socialId;

        if (userRole) {
            res.redirect(`${process.env.FRONTEND_URL}/Success?auth=${auth}`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/SuccessSignUp?auth=${auth}`);
        }
    })(req, res, next);
});

// Google SignIn
router.get('/auth/google/signin', passport.authenticate('google-signin'));
router.get('/auth/google/signin/callback', (req, res, next) => {
    passport.authenticate('google-signin', (err, user, info) => {
        if (err || info instanceof AuthorizationError || info?.error) {
            return res.redirect(`${process.env.FRONTEND_URL}/${info?.error != undefined ? 'SignIn?error=' + info?.error + '' : 'SignIn'}`);
        }
        const auth = user?.auth;

        const userRole = user?.user?.role;

        const socialId = user?.socialId;

        if (userRole) {
            res.redirect(`${process.env.FRONTEND_URL}/Success?auth=${auth}`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/SuccessSignUp?auth=${auth}`);
        }
    })(req, res, next);
});


router.get('/auth/facebook', passport.authenticate('facebook', { scope: [ 'email' ] }));
router.get('/auth/facebook/callback', (req, res, next) => {
    passport.authenticate('facebook', (err, user, info) => {
        if (err || info instanceof AuthorizationError || info?.error) {
            return res.redirect(`${process.env.FRONTEND_URL}/${info?.error != undefined ? 'SignIn?error=' + info?.error + '' : 'SignIn'}`);
        }
        const auth = user?.auth;
        const userRole = user?.user?.role;

        const socialId = user?.socialId;

        if (userRole) {
            res.redirect(`${process.env.FRONTEND_URL}/Success?auth=${auth}`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/SuccessSignUp?auth=${auth}`);
        }
    })(req, res, next);
});

// Facebook SignUp
router.get('/auth/facebook/signup', passport.authenticate('facebook-signup'));
router.get('/auth/facebook/signup/callback', (req, res, next) => {
    passport.authenticate('facebook-signup', (err, user, info) => {
        if (err || info instanceof AuthorizationError || info?.error) {
            return res.redirect(`${process.env.FRONTEND_URL}/${info?.error != undefined ? 'SignUp?error=' + info?.error + '' : 'SignUp'}`);
        }
        const auth = user?.auth;

        const userRole = user?.user?.role;

        const socialId = user?.socialId;

        if (userRole) {
            res.redirect(`${process.env.FRONTEND_URL}/Success?auth=${auth}`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/SuccessSignUp?auth=${auth}`);
        }
    })(req, res, next);
});

// Facebook SignIn
router.get('/auth/facebook/signin', passport.authenticate('facebook-signin'));
router.get('/auth/facebook/signin/callback', (req, res, next) => {
    passport.authenticate('facebook-signin', (err, user, info) => {
        if (err || info instanceof AuthorizationError || info?.error) {
            return res.redirect(`${process.env.FRONTEND_URL}/${info?.error != undefined ? 'SignIn?error=' + info?.error + '' : 'SignIn'}`);
        }
        const auth = user?.auth;

        const userRole = user?.user?.role;

        const socialId = user?.socialId;

        if (userRole) {
            res.redirect(`${process.env.FRONTEND_URL}/Success?auth=${auth}`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/SuccessSignUp?auth=${auth}`);
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
 *       - name: lang
 *         in: query
 *         description: Preferred language code of the user (e.g., 'en' for English, 'fr' for French)
 *         required: false
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
 * /api/verify-reset-token:
 *   get:
 *     summary: Verify password reset token
 *     description: Verify if the password reset token is valid, unused, and not expired. Redirects the user based on the token status.
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: The reset password token.
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token is valid, redirecting to the reset password page.
 *       400:
 *         description: Invalid or expired token, redirecting to the sign-in page.
 *       500:
 *         description: Internal server error.
 */
router.get('/verify-reset-token', UserController.verifyPasswordToken);

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
 *               lang:
 *                 type: string
 *                 description: Language preference for the email content (e.g., 'en', 'fr')
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
 *               language:
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
 * /users/verifyPasswordToken:
 *   get:
 *     summary: Confirm email verification
 *     description: Confirm email verification for a user by their ID
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Email verification confirmed successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.route("/verifyPasswordToken").get(UserController.verifyPasswordToken);

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
 * /users/count-by-month:
 *   get:
 *     summary: Get cumulative user counts by month up to the current year
 *     description: Retrieves the cumulative number of users registered up to each month of the current year.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A JSON object with cumulative user counts by month
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 year:
 *                   type: integer
 *                   example: 2024
 *                 monthlyCounts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "Jan"
 *                       count:
 *                         type: integer
 *                         example: 500
 *                 message:
 *                   type: string
 *                   example: "Successfully counted users registered up to each month for the year 2024"
 *       500:
 *         description: Internal server error
 */
router.get('/count-by-month', UserController.getUsersCountByMonth);

/**
 * @swagger
 * /users/distinct:
 *   get:
 *     summary: Récupère les valeurs distinctes d'un champ donné pour les utilisateurs
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: field
 *         schema:
 *           type: string
 *         required: true
 *         description: Nom du champ pour lequel récupérer les valeurs distinctes
 *     responses:
 *       200:
 *         description: Liste des valeurs distinctes récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 field:
 *                   type: string
 *                   description: Champ pour lequel les valeurs distinctes ont été récupérées
 *                 values:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Champ "field" manquant
 *       500:
 *         description: Erreur serveur
 */
router.get('/distinct', UserController.getDistinctFieldValues);


/**
 * @swagger
 * /users/ApproveUser/{userId}:
 *   put:
 *     summary: Approve a user
 *     description: Approve a user by their ID (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - name: userId
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
router.route("/ApproveUser/:userId").put(AuthController.AuthenticateAdmin, UserController.approveUser);

/**
 * @swagger
 * /users/RejectUser/{userId}:
 *   get:
 *     summary: Reject a user
 *     description: Reject a user by their ID (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - name: userId
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
router.route("/RejectUser/:userId").put(AuthController.AuthenticateAdmin, UserController.rejectUser);

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
 * /users/{userId}/updateProfile:
 *   put:
 *     summary: Update the user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of the user to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: "1234567890"
 *               website:
 *                 type: string
 *                 example: "https://example.com"
 *               address:
 *                 type: string
 *                 example: "123 Main St"
 *               facebook:
 *                 type: string
 *                 example: "facebook.com/johndoe"
 *               instagram:
 *                 type: string
 *                 example: "instagram.com/johndoe"
 *               twitter:
 *                 type: string
 *                 example: "twitter.com/johndoe"
 *               linkedin:
 *                 type: string
 *                 example: "linkedin.com/in/johndoe"
 *               language:
 *                 type: string
 *                 example: "English"
 *               region:
 *                 type: string
 *                 example: "North America"
 *               country:
 *                 type: string
 *                 example: "USA"
 *               cityState:
 *                 type: string
 *                 example: "New York"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (jpg, png, etc.)
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:userId/updateProfile', AuthController.AuthenticateUser, upload.single('image') , UserController.updateUserProfile);

/**
 * @swagger
 * /users/{userId}/languageRegion:
 *   put:
 *     summary: Update user language and region
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: body
 *         name: body
 *         description: The language and region to update
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             language:
 *               type: string
 *             region:
 *               type: string
 *     responses:
 *       200:
 *         description: The language and region were successfully updated
 *       404:
 *         description: User not found
 *       500:
 *         description: An error occurred
 */
router.put('/:userId/languageRegion',AuthController.AuthenticateUser, UserController.updateUserLanguageRegion)

/**
 * @swagger
 * /users/{userId}/updateWithJsn:
 *   put:
 *     summary: Update a user's information
 *     description: Update the details of a specific user by user ID. Passwords are hashed before saving.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: John Doe
 *             region:
 *               type: string
 *               example: John Doe
 *             language:
 *               type: string
 *               example: John Doe
 *             email:
 *               type: string
 *               example: john.doe@example.com
 *             password:
 *               type: string
 *               example: newpassword123
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 data:
 *                   type: object
 *                   description: The updated user data
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/:userId/updateWithJsn', UserController.updateUserController);

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
 * /users/OneUser/{userId}:
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
router.delete('/OneUser/:userId', UserController.deleteOneOfUser )

/**
 * @swagger
 * /users/updateFullName/{userId}:
 *   put:
 *     summary: Update user's full name
 *     tags: [Users]
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of the user to complete signup
 *         required: true
 *         schema:
 *           type: string
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
 *               image:
 *                 type: string
 *                 description: The new image of the user
 *               language:
 *                 type: string
 *                 description: The language of the user
 *     responses:
 *       200:
 *         description: Full name updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/updateFullName/:userId', UserController.updateFullName);

/**
 * @swagger
 * /users/send-email:
 *   post:
 *     summary: Send a contact email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               message:
 *                 type: string
 *               language:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       500:
 *         description: Error sending email
 */
router.post('/send-email', UserController.sendContactEmail);

/**
 * @swagger
 * /users/{userId}/changePassword:
 *   put:
 *     summary: Change the password of the user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: The password was changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/:userId/changePassword',AuthController.AuthenticateUser, UserController.changePassword);


module.exports = router