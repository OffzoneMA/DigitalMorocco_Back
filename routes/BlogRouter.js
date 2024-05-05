const express = require("express");
const router = express.Router();
const BlogController = require("../controllers/BlogController");
const AuthController = require("../controllers/AuthController");
const upload = require("../middelware/multer");


/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: API for managing blogs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID of the blog post
 *         title:
 *           type: string
 *         resume:
 *           type: string
 *         content:
 *           type: string
 *         details:
 *           type: string
 *         image:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         date:
 *           type: string
 *           format: date
 */

/**
 * @swagger
 * /blogs/createBlog:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Blogs]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the blog post (optional)
 *               title:
 *                 type: string
 *                 description: The title of the blog post
 *               resume:
 *                 type: string
 *                 description: A brief summary of the blog post
 *               details:
 *                 type: string
 *                 description: Additional details about the blog post
 *               content:
 *                 type: string
 *                 description: The content of the blog post
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of tags associated with the blog post
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/createBlog',AuthController.AuthenticateUser,upload.single("image"), BlogController.createBlog);

/**
 * @swagger
 * /blogs:
 *   get:
 *     summary: Get all blogs
 *     description: Retrieve a list of all blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Blog'
 */
router.get('/', BlogController.getAllBlogs);

/**
 * @swagger
 * /blogs/user/{userId}:
 *   get:
 *     summary: Get all blogs created by a user.
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               blogs: [...]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: Error message
 */
router.get('/user/:userId', BlogController.getAllBlogsByUser);

/**
 * @swagger
 * /blogs/{id}:
 *   get:
 *     summary: Get a blog by ID
 *     description: Retrieve a blog by its ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog not found
 */
router.get('/:id', BlogController.getBlogById);

/**
 * @swagger
 * /blogs/update/{id}:
 *   put:
 *     summary: Update a blog by ID
 *     description: Update an existing blog by its ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the blog post (optional)
 *               title:
 *                 type: string
 *                 description: The title of the blog post
 *               resume:
 *                 type: string
 *                 description: A brief summary of the blog post
 *               details:
 *                 type: string
 *                 description: Additional details about the blog post
 *               content:
 *                 type: string
 *                 description: The content of the blog post
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of tags associated with the blog post
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date of the blog post
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog not found
 */
router.put('/update/:id', upload.single('image'),  BlogController.updateBlog);

/**
 * @swagger
 * /blogs/delete/{id}:
 *   delete:
 *     summary: Delete a blog by ID
 *     description: Delete a blog by its ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Blog deleted successfully
 *       404:
 *         description: Blog not found
 */
router.delete('/delete/:id', BlogController.deleteBlog);

/**
 * @swagger
 * /blogs/latest/{limit}:
 *   get:
 *     summary: Get the latest blogs.
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               blogs: [...]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: Error message
 */
router.get('/latest/:limit', BlogController.getLatestBlogs);

module.exports = router