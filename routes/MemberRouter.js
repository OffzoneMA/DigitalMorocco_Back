const express = require("express")
const router = express.Router()
const MemberController = require("../controllers/MemberController")

router.route("/").post(MemberController.addStartup)
router.route("/name/:name").get(MemberController.getByName)


module.exports = router