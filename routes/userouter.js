const express = require("express")
const router = express.Router()
const AuthController = require("../controllers/AuthController")
const UserController = require("../controllers/UserController")
const UserService = require("../services/UserService")

const upload = require('../middelware/multer');

router.route("/").post(UserController.addUser).get(UserController.getUsers)
router.route("/complete_signup/:userid").post(UserService.checkUserVerification,upload.single('rc_ice'), UserController.complete_signup)
router.route("/sendverify/:userid").get(UserController.sendVerification)
router.route("/confirm_verification/:userid").get(UserController.confirmVerification)
router.route("/UserInfo").get(AuthController.userInfo)
router.route("/User/:id").delete(UserController.deleteUser)
router.route("/Login").post(AuthController.login)
router.route("/ApproveUser/:id").get(AuthController.AuthenticateAdmin,UserController.approveUser)
router.route("/RejectUser/:id").get(AuthController.AuthenticateAdmin, UserController.rejectUser)


module.exports=router