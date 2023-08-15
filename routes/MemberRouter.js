const express = require("express")
const router = express.Router()
const MemberController = require("../controllers/MemberController")
const AuthController = require("../controllers/AuthController")
const upload = require("../middelware/multer")

router.route("/").post(AuthController.AuthenticateMember, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'files', maxCount: 5 }]) ,MemberController.createEnterprise)

router.route("/name/:name").get(MemberController.getByName)
router.route("/project").post(AuthController.AuthenticateMember, upload.fields([{ name: 'files', maxCount: 8 }]), MemberController.createProject)

router.route("/SubscribeMember/:subid").get(AuthController.AuthenticateMember, MemberController.subUser)


module.exports = router