const express = require("express")
const router = express.Router()
const InvestorController = require("../controllers/InvestorController")
const AuthController = require("../controllers/AuthController")
const upload = require("../middelware/multer")

router.route("/").get(AuthController.AuthenticateSubMemberOrAdmin,InvestorController.getInvestors)

router.route("/ContactRequest").get(AuthController.AuthenticateInvestor, InvestorController.getContactRequests)
router.route("/ContactRequest/:requestId").put(AuthController.AuthenticateInvestor, InvestorController.updateContactStatus)

module.exports = router