const express = require("express")
const router = express.Router()
const AuthConroller = require("../controllers/AuthConroller")

router.route("/UserInfo").get(AuthConroller.UserInfo)
router.route("/Login").post(AuthConroller.login)

module.exports=router