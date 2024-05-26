const express = require('express');
const router = express.Router();
const FileController = require('../controllers/FileController')
const upload = require("../middelware/multer");


/**
 * @swagger
 * tags:
 *   name: File
 *   description: Operations related to file management
 */

/**
 * @swagger
 * /files/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [File]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 downloadURL:
 *                   type: string
 *                   description: URL for accessing the uploaded file
 */
router.post('/upload', upload.single('file') , FileController.uploadImage);

module.exports = router