const LegalDocumentService = require('../services/LegalDocumentService');

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


const createLegalDocument = async (req, res) => {
    try {
        const userId = req.userId;
        const documentData = isJsonString(req?.body) ? JSON.parse(req?.body) : req?.body; 
        const document = await LegalDocumentService.createLegalDocument(userId, documentData , req.file);
        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateLegalDocument = async (req, res) => {
    try {
        const documentId = req.params.documentId;
        const updateData = isJsonString(req?.body) ? JSON.parse(req?.body) : req?.body;
        const updatedDocument = await LegalDocumentService.updateLegalDocument(documentId, updateData ,  req.file);
        res.status(200).json(updatedDocument);
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message });
    } 
};

const getLegalDocumentById = async (req, res) => {
    try {
        const { documentId } = req.params;
        const document = await LegalDocumentService.getLegalDocumentById(documentId);
        res.status(200).json(document);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteLegalDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        await LegalDocumentService.deleteLegalDocument(documentId);
        res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getLegalDocuments = async (req, res) => {
    try {
        const documents = await LegalDocumentService.getLegalDocuments();
        res.status(200).json(documents);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getLegalDocumentsByUser = async (req, res) => {
    try {
        const userId = req.userId;
        const documents = await LegalDocumentService.getLegalDocumentsByUser(userId);
        res.status(200).json(documents);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createLegalDocument,
    updateLegalDocument,
    getLegalDocumentById,
    deleteLegalDocument,
    getLegalDocuments,
    getLegalDocumentsByUser
};