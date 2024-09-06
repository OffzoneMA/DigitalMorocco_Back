const DocumentService = require("../services/DocumentService");

async function getDocumentsForUser(req, res) {
    try {
        const userId = req.userId;
        const documents = await DocumentService.getDocumentsForUser(userId);
        res.status(200).json(documents);
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message });
    }
}

const getAllDocuments = async (req, res) => {
    try {
        const documents = await DocumentService.getAllDocuments();
        res.status(200).json({ success: true, data: documents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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
        const updateData = isJsonString(req?.body.documentData) ? JSON.parse(req?.body.documentData) : req?.body.documentData;
        const shareWithUsers = req?.body?.shareWithUsers;
        const docFile = req.files['docFile'];
        console.log(updateData)
        const updatedDocument = await DocumentService.updateDocument(documentId, updateData, docFile?.[0]);
        res.status(200).json(updatedDocument);
    } catch (error) {
        console.log(error)
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

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

async function createDocument(req, res) {
    try {
        const userId = req.userId; 
        const documentData = isJsonString(req?.body.documentData) ? JSON.parse(req?.body.documentData) : req?.body.documentData;
        const docFile = req.files['docFile'];
        console.log(documentData)
        const document = await DocumentService.createDocument(userId, documentData, docFile?.[0]);
        res.status(201).json(document);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const shareDocument = async (req, res) => {
    try {
        const document = await DocumentService.shareDocument(req.params.id, req.body.userIds, req.body.shareWith );
        res.status(200).json({ success: true, data: document });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message });
    }
};


const getShareWithData = async (req , res) => {
    try {
        const userId = req.userId;
        const data = await DocumentService.getShareWithData(userId);
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error: error });
    }
}


module.exports = {getDocumentsByUploader, getDocumentsForUser ,updateDocument, shareDocument ,
deleteDocument, getDocumentById, createDocument , getAllDocuments , getShareWithData}