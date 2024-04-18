const express = require('express');
const router = express.Router();
const DocumentController = require("../controllers/DocumentController");
const upload = require("../middelware/multer")

/**
 * @swagger
 * /documents/{memberId}/{userId}:
 *   post:
 *     summary: Créer un document pour un membre avec un utilisateur donné.
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentData:
 *                 type: object
 *               docFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '201':
 *         description: Document créé avec succès.
 *       '400':
 *         description: Erreur lors de la création du document.
 */
router.post('/:memberId/:userId', upload.single('docFile'), DocumentController.createDocument);

/**
 * @swagger
 * /documents/{documentId}:
 *   put:
 *     summary: Mettre à jour un document.
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Document mis à jour avec succès.
 *       '400':
 *         description: Erreur lors de la mise à jour du document.
 */
router.put('/:documentId',upload.single('docFile'), DocumentController.updateDocument);

/**
 * @swagger
 * /documents/{documentId}:
 *   delete:
 *     summary: Supprimer un document.
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
 * /documents/{memberId}:
 *   get:
 *     summary: Récupérer la liste des documents pour un membre donné.
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Liste des documents récupérée avec succès.
 *       '400':
 *         description: Erreur lors de la récupération de la liste des documents.
 */
router.get('/member/:memberId', DocumentController.getDocumentsForMember);

/**
 * @swagger
 * /documents/uploader/{userId}:
 *   get:
 *     summary: Récupérer la liste des documents téléchargés par un utilisateur donné.
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

// /**
//  * @swagger
//  * /documents/{documentId}/share:
//  *   post:
//  *     summary: Partager un document avec des utilisateurs.
//  *     parameters:
//  *       - in: path
//  *         name: documentId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               userIds:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *     responses:
//  *       '200':
//  *         description: Document partagé avec succès.
//  *       '400':
//  *         description: Erreur lors du partage du document.
//  */
// router.post('/:documentId/share', shareDocumentController);

module.exports = router;
