const storage = require('../config/FireStorage')
const { listAll,ref, uploadBytesResumable, getDownloadURL,  deleteObject } = require('firebase/storage');


const uploadFile = async (file,path,filename) => {

    try {
        const storageRef = ref(storage, `${path}/${filename}`); //const storageRef = ref(storage, `files/${req.file.originalname + " " + dateTime}`);
        const metadata = {
            contentType: file.mimetype,
        };
        const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL
    } catch (error) {
        throw new Error('Error uploading file');
    }

}

const deleteFile = async (filename,path) => {
    try {
        const storageRef = ref(storage, path + '/' + filename);
        await deleteObject(storageRef);
        return true; 
    } catch (error) {
        return false; 
    }
}

const deleteFolder = async (path) => {
    try {
        const storageRef = ref(storage, path );
        const items = await listAll(storageRef);
        const deletePromises = items.items.map(async (itemRef) => {
            await deleteObject(itemRef);
        });
        await Promise.all(deletePromises);
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

const extractPathAndFilename = (fullPath) => {
    const parts = fullPath.split('/');
    const filename = parts.pop(); // Récupérer le dernier élément (nom du fichier)
    const path = parts.join('/'); // Récupérer le reste du chemin
    return [path, filename];
};
  

module.exports = { deleteFolder,uploadFile, deleteFile  , extractPathAndFilename}