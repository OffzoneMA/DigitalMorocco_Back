const express = require("express")
const router = express.Router()
const requestController = require("../controllers/Requests")
const AuthController = require("../controllers/AuthController")

// Middleware to authenticate admin
router.use(AuthController.AuthenticateAdmin);



router.route("/").get(requestController.getRequests)





//For testing
router.route("/request/:id").delete(requestController.rejectRequest)



module.exports = router