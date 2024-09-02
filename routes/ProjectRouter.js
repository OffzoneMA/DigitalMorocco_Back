const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/ProjectController');

/**
 * @swagger
 * /projects/top-sectors:
 *   get:
 *     summary: Retrieve the top 5 sectors by project count with percentage
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: A list of the top 5 sectors with project counts and percentages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sectors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sector:
 *                         type: string
 *                         description: The sector name
 *                       count:
 *                         type: integer
 *                         description: The number of projects in this sector
 *                       percentage:
 *                         type: number
 *                         format: float
 *                         description: The percentage of projects in this sector relative to the total
 *       500:
 *         description: Failed to retrieve top sectors
 */
router.get('/top-sectors', ProjectController.getTopSectors);

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

/**
 * @swagger
 * /projects/{projectId}/milestones/{milestoneId}:
 *   delete:
 *     summary: Supprimer un jalon d'un projet
 *     tags: [Projects]
 *     description: Supprime un jalon spécifié d'un projet donné.
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID du projet
 *         schema:
 *           type: string
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         description: ID du jalon à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès, le jalon a été supprimé avec succès du projet.
 *       500:
 *         description: Erreur serveur, impossible de supprimer le jalon.
 */
router.delete('/:projectId/milestones/:milestoneId',ProjectController.removeMilestone)

/**
 * @swagger
 * /projects/{projectId}/status:
 *   patch:
 *     summary: Update the status of a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the project to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["In Progress", "Active", "Stand by"]
 *                 description: The new status of the project
 *                 example: "Active"
 *     responses:
 *       200:
 *         description: The project status was successfully updated
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
router.patch('/:projectId/status', ProjectController.updateProjectStatus);

module.exports = router