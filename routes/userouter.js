const express = require("express")
const router = express.Router()
const AuthConroller = require("../controllers/AuthConroller")
const UserController = require("../controllers/UserController")

router.route("/").post(UserController.addUser)
router.route("/UserInfo").get(AuthConroller.userInfo)
router.route("/Login").post(AuthConroller.login)
router.route("/ApproveUser/:id").get(AuthConroller.AuthenticateAdmin, UserController.approveUser)


module.exports=router