const express = require("express")
const router = express.Router()
const SubscriptionController = require("../controllers/SubscriptionController")

router.route("/").get(SubscriptionController.getSubscriptions)


module.exports = router