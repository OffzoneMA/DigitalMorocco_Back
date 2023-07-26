const storage=require('../config/FireStorage')
const { ref, uploadBytesResumable, getDownloadURL,  deleteObject } = require('firebase/storage');


const uploadFile = async (file,path,filename) => {

    try {
        const storageRef = ref(storage, `${path}/${filename}`); //        const storageRef = ref(storage, `files/${req.file.originalname + "       " + dateTime}`);
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


module.exports = { uploadFile, deleteFile }