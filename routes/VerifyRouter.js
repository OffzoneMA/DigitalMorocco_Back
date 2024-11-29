const express = require("express")
const router = express.Router()
const UserController = require('../controllers/UserController');

/**
 * @swagger
 * /verify/{token}:
 *   get:
 *     summary: Confirm email verification
 *     description: Confirm email verification for a user by token
 *     tags: [Users]
 *     parameters:
 *       - name: token
 *         in: path
 *         description: ID of the user to confirm email verification
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: lang
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
router.route("/:token").get(UserController.confirmVerification);

module.exports = router