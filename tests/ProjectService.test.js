const Project = require('../models/Project');
const { getProjectByMemberId } = require('../services/ProjectService');

// Mock the Project model
jest.mock('../models/Project');

describe('getProjectByMemberId', () => {
  it('should return the project with the given member id', async () => {
    // Arrange
    const memberId = '123456789';
    const expectedProject = { id: 'project123', name: 'My Project', owner: memberId };
    Project.findOne.mockResolvedValue(expectedProject);

    // Act
    const result = await getProjectByMemberId(memberId);

    // Assert
    expect(result).toEqual(expectedProject);
    expect(Project.findOne).toHaveBeenCalledWith({ owner: memberId });
  });

  it('should return null if no project is found', async () => {
    // Arrange
    const memberId = '987654321';
    Project.findOne.mockResolvedValue(null);

    // Act
    const result = await getProjectByMemberId(memberId);

    // Assert
    expect(result).toBeNull();
    expect(Project.findOne).toHaveBeenCalledWith({ owner: memberId });
  });

  it('should throw an error if an exception occurs', async () => {
    // Arrange
    const memberId = '123456789';
    const expectedError = new Error('Database error');
    Project.findOne.mockRejectedValue(expectedError);

    // Act & Assert
    await expect(getProjectByMemberId(memberId)).rejects.toThrow(expectedError);
    expect(Project.findOne).toHaveBeenCalledWith({ owner: memberId });
  });
});describe('getProjectByMemberId', () => {
  it('should return the project with the given member id', async () => {
    // Arrange
    const memberId = '123456789';
    const expectedProject = { id: 'project123', name: 'My Project', owner: memberId };
    Project.findOne.mockResolvedValue(expectedProject);

    // Act
    const result = await getProjectByMemberId(memberId);

    // Assert
    expect(result).toEqual(expectedProject);
    expect(Project.findOne).toHaveBeenCalledWith({ owner: memberId });
  });

  it('should return null if no project is found', async () => {
    // Arrange
    const memberId = '987654321';
    Project.findOne.mockResolvedValue(null);

    // Act
    const result = await getProjectByMemberId(memberId);

    // Assert
    expect(result).toBeNull();
    expect(Project.findOne).toHaveBeenCalledWith({ owner: memberId });
  });

  it('should throw an error if an exception occurs', async () => {
    // Arrange
    const memberId = '123456789';
    const expectedError = new Error('Database error');
    Project.findOne.mockRejectedValue(expectedError);

    // Act & Assert
    await expect(getProjectByMemberId(memberId)).rejects.toThrow(expectedError);
    expect(Project.findOne).toHaveBeenCalledWith({ owner: memberId });
  });
});

describe('ProjectService', () => {
  it('should call Project.findOne with the correct parameters', async () => {
    // Arrange
    const memberId = '123456789';

    // Act
    await getProjectByMemberId(memberId);

    // Assert
    expect(Project.findOne).toHaveBeenCalledWith({ owner: memberId });
  });
});