const express = require("express")
const router = express.Router()
const AuthConroller = require("../controllers/AuthConroller")
const UserControlller = require("../controllers/AuthConroller")

router.route("/").post(UserController.addUser)
router.route("/UserInfo").get(AuthConroller.UserInfo)
router.route("/Login").post(AuthConroller.login)


module.exports=router