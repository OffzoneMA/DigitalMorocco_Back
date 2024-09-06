const express = require('express');
const router = express.Router();
const DocumentController = require("../controllers/DocumentController");
const upload = require("../middelware/multer")
const AuthController = require("../controllers/AuthController");

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: API for Documents operations
 */

/**
 * @swagger
 * /documents/all:
 *   get:
 *     summary: Retrieve a list of all documents
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: List of all documents
 */
router.get('/all', DocumentController.getAllDocuments);

/**
 * @swagger
 * /documents/user:
 *   get:
 *     summary: Récupérer la liste des documents pour un membre donné.
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: Liste des documents récupérée avec succès.
 *       400:
 *         description: Erreur lors de la récupération de la liste des documents.
 */
router.get('/user',AuthController.AuthenticateUser , DocumentController.getDocumentsForUser);


/**
 * @swagger
 * /documents/shareWithData:
 *   get:
 *     summary: Retrieve a list of employees and investors.
 *     tags: [Documents]
 *     description: Fetch a certain number of employees and investors and return them in a combined format.
 *     responses:
 *       200:
 *         description: A list of entities.
 *       500:
 *         description: Error fetching data.
 */
router.get('/shareWithData' , AuthController.AuthenticateUser , DocumentController.getShareWithData)

/**
 * @swagger
 * /documents/new:
 *   post:
 *     summary: Create a new document
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documentData:
 *                 type: object
 *                 description: Document data
 *               docFile:
 *                 type: string
 *                 format: binary
 *                 description: Document file
 *     responses:
 *       201:
 *         description: Document created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       400:
 *         description: Bad request
 */
router.post('/new', AuthController.AuthenticateUser , upload.fields([{ name: 'docFile', maxCount: 1 }]) , DocumentController.createDocument);

/**
 * @swagger
 * /documents/{id}:
 *   put:
 *     summary: Update a document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               updateData:
 *                 type: object
 *                 description: Data to update the document
 *               docFile:
 *                 type: string
 *                 format: binary
 *                 description: Updated document file
 *     responses:
 *       200:
 *         description: Document updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       404:
 *         description: Document not found
 *       400:
 *         description: Bad request
 */ 
router.put('/:documentId', upload.fields([{ name: 'docFile', maxCount: 1 }]) , DocumentController.updateDocument);

/**
 * @swagger
 * /documents/{documentId}:
 *   delete:
 *     summary: Supprimer un document.
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Document supprimé avec succès.
 *       '400':
 *         description: Erreur lors de la suppression du document.
 */
router.delete('/:documentId', DocumentController.deleteDocument);

/**
 * @swagger
 * /documents/{documentId}:
 *   get:
 *     summary: Récupérer un document par ID.
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Document récupéré avec succès.
 *       '400':
 *         description: Erreur lors de la récupération du document.
 */
router.get('/:documentId', DocumentController.getDocumentById);

/**
 * @swagger
 * /documents/uploader/{userId}:
 *   get:
 *     summary: Récupérer la liste des documents téléchargés par un utilisateur donné.
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Liste des documents récupérée avec succès.
 *       '400':
 *         description: Erreur lors de la récupération de la liste des documents.
 */
router.get('/uploader/:userId', DocumentController.getDocumentsByUploader);

/**
 * @swagger
 * /documents/{id}/share:
 *   post:
 *     summary: Share a document with users
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of user IDs to share the document with
 *               shareWith:
 *                 type: string
 *                 description: Type of sharing (all, Members , Investors , Partners, individual)
 *     responses:
 *       200:
 *         description: Document shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       404:
 *         description: Document not found
 *       400:
 *         description: Bad request
 */
router.post('/:id/share', DocumentController.shareDocument);

module.exports = router;
