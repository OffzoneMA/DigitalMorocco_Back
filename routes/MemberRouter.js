const express = require("express")
const router = express.Router()
const MemberController = require("../controllers/MemberController")
const AuthController = require("../controllers/AuthController")
const upload = require("../middelware/multer")

router.route("/").get( MemberController.getMembers).post(AuthController.AuthenticateMember, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'files', maxCount: 5 }]) ,MemberController.createEnterprise)

router.route("/name/:name").get(MemberController.getByName)
router.route("/project").post(AuthController.AuthenticateMember, upload.fields([{ name: 'files', maxCount: 8 }]), MemberController.createProject)
router.route("/ContactRequest/:investorId").post(AuthController.AuthenticateSubMember, MemberController.contactRequest )
router.route("/ContactRequest").get(AuthController.AuthenticateMember, MemberController.getContactRequests)

router.route("/SubscribeMember/:subid").get(AuthController.AuthenticateMember, MemberController.subUser)


module.exports = router