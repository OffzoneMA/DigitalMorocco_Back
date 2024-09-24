const express = require('express');
const SearchController = require('../controllers/SearchControllers');
const router = express.Router();
const AuthController = require("../controllers/AuthController")

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search across models like members, events, and investors
 *     description: Use this API to search across multiple models, filtering data based on the user's role (member, investor, or admin).
 *     tags:
 *       - Search
 *     parameters:
 *       - name: searchQuery
 *         in: query
 *         required: true
 *         description: The search keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success, returns the search results
 *         content:
 *       500:
 *         description: Server error
 */
router.get('/', AuthController.AuthenticateUser , SearchController.searchAcrossModels);

module.exports = router;
