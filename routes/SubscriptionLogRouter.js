const express = require("express")
const router = express.Router()
const SubscriptionLogController = require("../controllers/SubscriptionLogController")
const AuthController = require("../controllers/AuthController")

router.route("/").get(AuthController.AuthenticateAdmin, SubscriptionLogController.getAllLogs)
router.route("/byMember").get(AuthController.AuthenticateMember, SubscriptionLogController.getAllLogsByUser)



module.exports = router