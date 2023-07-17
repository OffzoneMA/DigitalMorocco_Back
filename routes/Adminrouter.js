const express = require("express")
const router = express.Router()
const AuthConroller = require("../controllers/AuthConroller")
const AdminController = require("../controllers/AdminController")

router.route("/").post(AdminController.addAdmin)


module.exports = router