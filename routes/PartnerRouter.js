const express = require("express")
const router = express.Router()
const PartnerController = require("../controllers/PartnerController")
const AuthController = require("../controllers/AuthController")
const upload = require("../middelware/multer")

router.route("/").get(PartnerController.getpartners).post(AuthController.AuthenticatePartner, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'files', maxCount: 5 }]) ,PartnerController.createEnterprise)


module.exports = router