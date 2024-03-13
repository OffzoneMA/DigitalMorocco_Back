const Member = require('../models/Member');
const Project = require('../models/Project');
const uploadService = require('../services/uploadService');
const { createProject } = require('../services/MemberService');

// Mock the Member and Project models
jest.mock('../models/Member');
jest.mock('../models/Project');

// Mock the uploadService.uploadFile function
jest.mock('../services/uploadService', () => ({
  uploadFile: jest.fn().mockImplementation((file, path, originalname) => {
    return Promise.resolve(`https://example.com/${path}/${originalname}`);
  })
}));

describe('createProject', () => {
  it('should create a new project if it does not exist', async () => {
    // Mock the findById method of Member model to return a sample member
    Member.findById.mockResolvedValue({
      _id: '1',
      owner: 'member1',
      name: 'John Doe'
    });

    // Mock the findOne method of Project model to return null (project does not exist)
    Project.findOne.mockResolvedValue(null);

    // Mock the save method of Project model
    Project.prototype.save.mockResolvedValue();

    // Mock the uploadService.uploadFile function to return a sample file link
    uploadService.uploadFile.mockResolvedValue('https://example.com/members/member1/Project_documents/file1.pdf');

    // Mock the input parameters
    const memberId = '1';
    const infos = {
      name: 'Project 1',
      fundingAmount: 10000,
      currency: 'USD',
      details: 'Project details',
      milestoneProgress: 50,
      listMembers: ['member1', 'member2'],
      visbility: 'public'
    };
    const documents = {
      files: [
        { originalname: 'file1.pdf', mimetype: 'application/pdf' },
        { originalname: 'file2.jpg', mimetype: 'image/jpeg' }
      ]
    };

    // Call the createProject function
    const result = await createProject(memberId, infos, documents);

    // Assert the result
    expect(result).toEqual(expect.any(Object));

    // Assert that the findById method was called with the correct arguments
    expect(Member.findById).toHaveBeenCalledWith(memberId);

    // Assert that the findOne method was called with the correct arguments
    expect(Project.findOne).toHaveBeenCalledWith({ owner: memberId });

    // Assert that the save method was called
    expect(Project.prototype.save).toHaveBeenCalled();

    // Assert that the uploadFile function was called for each document
    expect(uploadService.uploadFile).toHaveBeenCalledTimes(2);
    expect(uploadService.uploadFile).toHaveBeenCalledWith(
      documents.files[0],
      `Members/${memberId}/Project_documents`,
      documents.files[0].originalname
    );
    expect(uploadService.uploadFile).toHaveBeenCalledWith(
      documents.files[1],
      `Members/${memberId}/Project_documents`,
      documents.files[1].originalname
    );
  });

  it('should update an existing project if it exists', async () => {
    // Mock the findById method of Member model to return a sample member
    Member.findById.mockResolvedValue({
      _id: '1',
      owner: 'member1',
      name: 'John Doe'
    });

    // Mock the findOne method of Project model to return a sample project
    Project.findOne.mockResolvedValue({
      _id: '1',
      owner: 'member1',
      name: 'Project 1',
      funding: 5000,
      currency: 'USD',
      details: 'Project details',
      milestoneProgress: 25,
      listMember: ['member1'],
      visbility: 'private',
      documents: [
        { name: 'file1.pdf', link: 'https://example.com/members/member1/Project_documents/file1.pdf', type: 'application/pdf' }
      ]
    });

    // Mock the save method of Project model
    Project.prototype.save.mockResolvedValue();

    // Mock the uploadService.uploadFile function to return a sample file link
    uploadService.uploadFile.mockResolvedValue('https://example.com/members/member1/Project_documents/file2.jpg');

    // Mock the input parameters
    const memberId = '1';
    const infos = {
      name: 'Updated Project',
      fundingAmount: 8000,
      currency: 'EUR',
      details: 'Updated project details',
      milestoneProgress: 75,
      listMembers: ['member1', 'member2', 'member3'],
      visbility: 'public'
    };
    const documents = {
      files: [
        { originalname: 'file2.jpg', mimetype: 'image/jpeg' },
        { originalname: 'file3.png', mimetype: 'image/png' }
      ]
    };

    // Call the createProject function
    const result = await createProject(memberId, infos, documents);

    // Assert the result
    expect(result).toEqual(expect.any(Object));

    // Assert that the findById method was called with the correct arguments
    expect(Member.findById).toHaveBeenCalledWith(memberId);

    // Assert that the findOne method was called with the correct arguments
    expect(Project.findOne).toHaveBeenCalledWith({ owner: memberId });

    // Assert that the save method was called
    expect(Project.prototype.save).toHaveBeenCalled();

    // Assert that the uploadFile function was called for each document
    expect(uploadService.uploadFile).toHaveBeenCalledTimes(2);
    expect(uploadService.uploadFile).toHaveBeenCalledWith(
      documents.files[0],
      `Members/${memberId}/Project_documents`,
      documents.files[0].originalname
    );
    expect(uploadService.uploadFile).toHaveBeenCalledWith(
      documents.files[1],
      `Members/${memberId}/Project_documents`,
      documents.files[1].originalname
    );
  });
});