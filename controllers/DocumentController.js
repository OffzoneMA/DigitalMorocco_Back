const DocumentService = require("../services/DocumentService");

async function getDocumentsForMember(req, res) {
    try {
        const memberId = req.params.memberId;
        const documents = await DocumentService.getDocumentsForMember(memberId);
        res.status(200).json(documents);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function getDocumentsByUploader(req, res) {
    try {
        const userId = req.params.userId;
        const documents = await DocumentService.getDocumentsByUploader(userId);
        res.status(200).json(documents);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function updateDocument(req, res) {
    try {
        const documentId = req.params.documentId;
        const updateData = req.body;
        const docFile = req.file;
        const updatedDocument = await DocumentService.updateDocument(documentId, updateData, docFile);
        res.status(200).json(updatedDocument);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function deleteDocument(req, res) {
    try {
        const documentId = req.params.documentId;
        await DocumentService.deleteDocument(documentId);
        res.status(204).send(); 
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function getDocumentById(req, res) {
    try {
        const documentId = req.params.documentId;
        const document = await DocumentService.getDocumentById(documentId);
        res.status(200).json(document);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function createDocument(req, res) {
    try {
        const { memberId, userId } = req.params; 
        const documentData = req.body;
        const docFile = req.file;
        const document = await DocumentService.createDocument(memberId, userId, documentData, docFile);
        res.status(201).json(document);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {getDocumentsByUploader, getDocumentsForMember ,updateDocument,
deleteDocument, getDocumentById, createDocument}