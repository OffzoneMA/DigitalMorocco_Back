const express = require("express")
const router = express.Router()
const UserLogController = require("../controllers/UserLogController")
const AuthController = require("../controllers/AuthController")

router.route("/").get(AuthController.AuthenticateAdmin, UserLogController.getAllLogs)



module.exports = router