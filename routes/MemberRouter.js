const express = require("express")
const router = express.Router()
const MemberController = require("../controllers/MemberController")
const AuthController = require("../controllers/AuthController")

router.route("/").post(AuthController.AuthenticateMember,MemberController.createEnterprise)

router.route("/name/:name").get(MemberController.getByName)

router.route("/SubscribeMember/:subid").get(AuthController.AuthenticateMember, MemberController.subUser)


module.exports = router