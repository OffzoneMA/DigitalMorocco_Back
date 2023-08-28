const express = require("express")
const router = express.Router()
const InvestorController = require("../controllers/InvestorController")
const AuthController = require("../controllers/AuthController")
const upload = require("../middelware/multer")

router.route("/").get(AuthController.AuthenticateSubMemberOrAdmin,InvestorController.getInvestors)


module.exports = router