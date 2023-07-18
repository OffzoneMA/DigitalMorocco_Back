const express = require("express")
const router = express.Router()
const AuthController = require("../controllers/AuthController")
const UserController = require("../controllers/UserController")

router.route("/").post(UserController.addUser).get(UserController.getUsers)
router.route("/UserInfo").get(AuthController.userInfo)
router.route("/User/:id").delete(UserController.deleteUser)
router.route("/Login").post(AuthController.login)
router.route("/ApproveUser/:id").get(AuthController.AuthenticateAdmin,UserController.approveUser)
router.route("/RejectUser/:id").get(AuthController.AuthenticateAdmin, UserController.rejectUser)


module.exports=router