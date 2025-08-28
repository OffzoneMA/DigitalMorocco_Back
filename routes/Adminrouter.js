const express = require("express")
const router = express.Router()
const AuthController = require("../controllers/AuthController")
const AdminController = require("../controllers/AdminController")

router.route("/").post(AuthController.AuthenticateAdmin,AdminController.addAdmin)

module.exports = router