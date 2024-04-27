const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/ProjectController');

/**
 * @swagger
 * /projects/{projectId}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     description: Delete a project by its ID.
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID of the project to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully.
 */
router.delete('/:projectId', ProjectController.deleteProject);

/**
 * @swagger
 * /projects/{projectId}:
 *   get:
 *     summary: Retrieve a project by ID
 *     tags: [Projects]
 *     description: Retrieve a project by its ID.
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID of the project to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The project.
 *       404:
 *         description: Project not found.
 */
router.get('/:projectId', ProjectController.getProjectById);

/**
 * @swagger
 * /projects/{projectId}/milestones:
 *   post:
 *     summary: Add a milestone to a project
 *     description: Add a new milestone to an existing project.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the project to add the milestone to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the milestone.
 *               description:
 *                 type: string
 *                 description: Description of the milestone.
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date of the milestone.
 *     responses:
 *       200:
 *         description: Successful response

 *       400:
 *         description: Bad Request - Invalid input data
 *       500:
 *         description: Internal Server Error
 */
router.post('/:projectId/milestones', ProjectController.addMilestone);

module.exports = router