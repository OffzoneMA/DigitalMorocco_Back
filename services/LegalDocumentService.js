const LegalDocument = require('../models/LegalDocuments');
const ActivityHistoryService = require('../services/ActivityHistoryService');
const UserService = require('../services/UserService');
const uploadService = require('../services/FileService');

const createLegalDocument = async (userId, documentData , docFile) => {
    try {
        const user = await UserService.getUserByID(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const newDocument = new LegalDocument(documentData);
        newDocument.createdBy = userId;
        newDocument.updatedBy = userId;
        if (docFile) {
            const savedDocument = await newDocument.save();
            const docURL = await uploadService.uploadFile(
                docFile,
                `Users/${userId}/legalDocuments/${savedDocument._id}`,
                docFile.originalname
            );
            savedDocument.link = docURL;
            savedDocument.type = docFile.mimetype;
            savedDocument.name = docFile.originalname;
            await savedDocument.save();
        } else {
            await newDocument.save();
        }
        await ActivityHistoryService.createActivityHistory(
            userId,
            'legal_document_created',
            { targetName: documentData.name, targetDesc: `` }
        );
        return newDocument;
    } catch (error) {
        throw error;
    }
};

const updateLegalDocument = async (documentId, updateData, docFile) => {
    try {
        const document = await LegalDocument.findById(documentId);
        if (!document) {
            throw new Error("Document not found");
        }
        if (docFile) {
            const docURL = await uploadService.uploadFile(
                docFile,
                `Users/${document.createdBy}/legalDocuments/${document._id}`,
                docFile.originalname
            );
            document.link = docURL;
            document.type = docFile.mimetype;
            document.name = docFile.originalname;
        }
        document.lastModifiedDate = Date.now();
        document.title = updateData.title;
        document.updatedBy = updateData.updatedBy;
        await document.save();
        await ActivityHistoryService.createActivityHistory(
            document.updatedBy,
            'legal_document_updated',
            { targetName: document.name, targetDesc: `` }
        );
        return document;
    } catch (error) {
        throw error;
    }
};

const deleteLegalDocument = async (documentId) => {
    try {
        const deletedDocument = await LegalDocument.findByIdAndDelete(documentId);
        if (!deletedDocument) {
            throw new Error("Document not found");
        }
        await ActivityHistoryService.createActivityHistory(
            deletedDocument.updatedBy,
            'legal_document_deleted',
            { targetName: deletedDocument.name, targetDesc: `` }
        );
        return deletedDocument;
    } catch (error) {
        throw error;
    }
};
const getLegalDocumentById = async (documentId) => {
    try {
        const document = await LegalDocument.findById(documentId);
        if (!document) {
            throw new Error("Document not found");
        }
        return document;
    } catch (error) {
        throw error;
    }
};

const getLegalDocuments = async () => {
    try {
        const documents = await LegalDocument.find({})
            .populate('createdBy') 
        return documents;
    } catch (error) {
        throw error;
    }
};

const getLegalDocumentsByUser = async (userId) => {
    try {
        const documents = await LegalDocument.find({ createdBy: userId })
            .populate('createdBy') 
        return documents;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createLegalDocument,
    updateLegalDocument,
    deleteLegalDocument,
    getLegalDocumentById,
    getLegalDocuments,
    getLegalDocumentsByUser
};