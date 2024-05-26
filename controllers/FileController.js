const FileService = require('../services/FileService')

const uploadImage = async (req, res) => {
    try {
        const file = req.file;
        const path = 'Site_Assets'; 
        const filename = file.originalname; 
        const downloadURL = await FileService.uploadFile(file, path, filename);
        res.json({ downloadURL });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
};

module.exports = {
    uploadImage,
};