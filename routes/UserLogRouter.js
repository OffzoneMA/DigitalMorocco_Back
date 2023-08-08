const express = require("express")
const router = express.Router()
const UserLogController = require("../controllers/UserLogController")
const AuthController = require("../controllers/AuthController")

router.route("/").get(AuthController.AuthenticateAdmin, UserLogController.getAllLogs)
router.route("/byUser").get(AuthController.AuthenticateUser, UserLogController.getAllLogsByUser)



module.exports = router