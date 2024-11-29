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
 * /projects/all:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     description: Retrieve a list of all projects with optional filters for visibility, status, date, sector, stage, and country.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 15
 *         description: Number of projects per page.
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *         description: Visibility of the project.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Status of the project.
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter projects created after this date (YYYY-MM-DD).
 *       - in: query
 *         name: sectors
 *         schema:
 *           type: string
 *         description: Comma-separated list of sectors for filtering.
 *       - in: query
 *         name: stages
 *         schema:
 *           type: string
 *         description: Comma-separated list of stages for filtering.
 *       - in: query
 *         name: countries
 *         schema:
 *           type: string
 *         description: Comma-separated list of countries for filtering.
 *     responses:
 *       200:
 *         description: A list of projects with pagination info
 *       500:
 *         description: Server error
 */
router.get('/all', ProjectController.getAllProjects);


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

/**
 * @swagger
 * /projects/{projectId}/update:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID of the project to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               owner:
 *                 type: string
 *               name:
 *                 type: string
 *               funding:
 *                 type: number
 *               totalRaised:
 *                 type: number
 *               country:
 *                 type: string
 *               sector:
 *                 type: string
 *               website:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               logo:
 *                 type: string
 *               currency:
 *                 type: string
 *                 enum: [MAD, €, $, USD]
 *               details:
 *                 type: string
 *               milestones:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                     completed:
 *                       type: boolean
 *               visbility:
 *                 type: string
 *                 enum: [public, private]
 *               status:
 *                 type: string
 *                 enum: [In Progress, Active, Stand by]
 *               stage:
 *                 type: string
 *               shareWithInvestors:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Error updating project
 */
router.put('/:projectId/update', ProjectController.updateProject);

/**
 * @swagger
 * /projects/{projectId}/documents/{documentId}:
 *   delete:
 *     summary: Delete a document from a project
 *     tags: [Projects]
 *     description: Remove a specific document from a project by projectId and documentId.
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *       - in: path
 *         name: documentId
 *         required: true
 *         description: ID of the document to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Document deleted successfully"
 *       400:
 *         description: Error message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Project or document not found
 */
router.delete('/:projectId/documents/:documentId', ProjectController.deleteProjectDocument);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Retrieve all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: A list of the top 5 sectors with project counts and percentages
 *         content:
 *       500:
 *         description: Failed to retrieve top sectors
 */
router.get('/', ProjectController.getprojects);

/**
 * @swagger
 * /projects/distinct/{field}:
 *   get:
 *     summary: Get distinct values for a specified field in projects
 *     tags: [Projects]
 *     description: Retrieve a list of unique values for a specific field (e.g., sector, country) in projects.
 *     parameters:
 *       - in: path
 *         name: field
 *         required: true
 *         schema:
 *           type: string
 *         description: The field to retrieve distinct values for (e.g., "sector", "stage", "country").
 *     responses:
 *       200:
 *         description: A list of distinct values for the specified field
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 field:
 *                   type: string
 *                   description: The field name for which distinct values were requested.
 *                 values:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get('/distinct/:field', ProjectController.getDistinctValuesForField);

module.exports = router