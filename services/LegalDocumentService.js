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
            const docURL = await uploadService.uploadFile(
                docFile,
                `Users/${userId}/legalDocuments/${newDocument._id}`,
                docFile.originalname
            );
            newDocument.link = docURL;
            newDocument.type = docFile.mimetype;
            newDocument.name = docFile.originalname;
        } 
        await newDocument.save();
        const extension = newDocument.name?.split('.')?.pop();

        await ActivityHistoryService.createActivityHistory(
            userId,
            'legal_document_created',
            { targetName: `${newDocument?.title}.${extension}`, targetDesc: `` }
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
        document.updatedBy = updateData.updatedBy || document.createdBy ;
        await document.save();

        const extension = document.name?.split('.')?.pop();
        await ActivityHistoryService.createActivityHistory(
            document?.updatedBy || document?.createdBy,
            'legal_document_updated',
            { targetName: `${document?.title}.${extension}`, targetDesc: `` }
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
        const extension = deletedDocument?.name?.split('.')?.pop();

        await ActivityHistoryService.createActivityHistory(
            deletedDocument.updatedBy,
            'legal_document_deleted',
            { targetName: `${deletedDocument?.title}.${extension}`, targetDesc: `` }
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
            .populate('createdBy').sort({ dateCreated: 'desc' })
        return documents;
    } catch (error) {
        throw error;
    }
};

const getLegalDocumentsByUser = async (userId, args) => {
    try {
        const page = args.page || 1;
        const pageSize = args.pageSize || 8;
        const skip = (page - 1) * pageSize;
        const totalCount = await LegalDocument.countDocuments({ createdBy: userId });
        const totalPages = Math.ceil(totalCount / pageSize);
        const documents = await LegalDocument.find({ createdBy: userId })
            .populate('createdBy')
            .skip(skip)
            .sort({ dateCreated: 'desc' })
            .limit(pageSize);

        return { documents, totalPages };
    } catch (error) {
        throw new Error('Error fetching legal documents by user: ' + error.message);
    }
};

const searchLegalDocuments = async (user, searchTerm) => {
    try {
        const regex = new RegExp(searchTerm, 'i'); 

        let filter = {};

        if (user?.role?.toLowerCase() === 'admin') {
            filter = {};
        } else {
            filter = { createdBy: user._id };
        }

        const documents = await LegalDocument.find({
            ...filter,
            $or: [
                { title: regex }, 
                // { name: regex },         
                // { description: regex },   
                // { type: regex }   
            ]
        }).populate('createdBy'); 

        return documents;
    } catch (error) {
        throw new Error('Error searching legal documents: ' + error.message);
    }
};


module.exports = {
    createLegalDocument,
    updateLegalDocument,
    deleteLegalDocument,
    getLegalDocumentById,
    getLegalDocuments,
    getLegalDocumentsByUser , searchLegalDocuments
};