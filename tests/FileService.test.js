const { ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage');
const { storage } = require('firebase/app');
const { uploadFile } = require('../services/FileService');

// Mock the required dependencies
jest.mock('firebase/storage');
jest.mock('firebase/app');

describe('uploadFile', () => {
  it('should upload a file and return the download URL', async () => {
    // Mock the necessary data and functions
    const file = {
      mimetype: 'image/jpeg',
      buffer: Buffer.from('file content'),
    };
    const path = 'files';
    const filename = 'example.jpg';
    const storageRef = { /* mocked storage reference */ };
    const metadata = { contentType: file.mimetype };
    const snapshot = { ref: storageRef };
    const downloadURL = 'https://example.com/download';

    ref.mockReturnValue(storageRef);
    uploadBytesResumable.mockResolvedValue(snapshot);
    getDownloadURL.mockResolvedValue(downloadURL);

    // Call the function being tested
    const result = await uploadFile(file, path, filename);

    // Assert the expected results
    expect(result).toEqual(downloadURL);

    // Assert that the necessary functions were called with the correct arguments
    expect(ref).toHaveBeenCalledWith(storage, `${path}/${filename}`);
    expect(uploadBytesResumable).toHaveBeenCalledWith(storageRef, file.buffer, metadata);
    expect(getDownloadURL).toHaveBeenCalledWith(snapshot.ref);
  });

  it('should throw an error if there is an error uploading the file', async () => {
    // Mock the necessary data and functions
    const file = {
      mimetype: 'image/jpeg',
      buffer: Buffer.from('file content'),
    };
    const path = 'files';
    const filename = 'example.jpg';
    const storageRef = { /* mocked storage reference */ };
    const metadata = { contentType: file.mimetype };
    const error = new Error('Error uploading file');

    ref.mockReturnValue(storageRef);
    uploadBytesResumable.mockRejectedValue(error);

    // Call the function being tested and expect it to throw an error
    await expect(uploadFile(file, path, filename)).rejects.toThrow('Error uploading file');

    // Assert that the necessary functions were called with the correct arguments
    expect(ref).toHaveBeenCalledWith(storage, `${path}/${filename}`);
    expect(uploadBytesResumable).toHaveBeenCalledWith(storageRef, file.buffer, metadata);
  });

  // Add more test cases to cover other scenarios and edge cases
});