// __tests__/projectService.test.js
const Project = require('../models/Project');
const ActivityHistoryService = require('../services/ActivityHistoryService');
const MemberService = require('../services/MemberService');
const {
  getProjects,
  CreateProject,
  getProjectById,
  ProjectByNameExists,
  getProjectByMemberId,
  deleteProject,
  addMilestone,
  removeMilestone,
  countProjectsByMember,
  countProjectsByMemberId,
  updateProjectStatus,
  getTopSectors,
} = require('../services/ProjectService');

// Mocking dependencies
jest.mock('../models/Project');
jest.mock('../services/ActivityHistoryService');
jest.mock('../services/MemberService');

describe('Project Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CreateProject', () => {
    it('should create a new project', async () => {
      const newProject = { name: 'Test Project' };
      Project.create.mockResolvedValue(newProject);

      const result = await CreateProject(newProject);

      expect(Project.create).toHaveBeenCalledWith(newProject);
      expect(result).toEqual(newProject);
    });
  });

  describe('getProjectById', () => {
    it('should return a project by its ID', async () => {
      const projectId = 'projectId123';
      const project = { _id: projectId, name: 'Test Project' };
      Project.findById.mockResolvedValue(project);

      const result = await getProjectById(projectId);

      expect(Project.findById).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(project);
    });

    it('should return null if project is not found', async () => {
      const projectId = 'projectId123';
      Project.findById.mockResolvedValue(null);

      const result = await getProjectById(projectId);

      expect(Project.findById).toHaveBeenCalledWith(projectId);
      expect(result).toBeNull();
    });
  });

  describe('getProjects', () => {
    it('should return a list of projects', async () => {
      const mockProjects = [{ name: 'Project 1' }, { name: 'Project 2' }];
      const args = { start: 0, qt: 2 };
      Project.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockProjects),
      });

      const result = await getProjects(args);

      expect(Project.find).toHaveBeenCalled();
      expect(result).toEqual(mockProjects);
    });

    it('should handle errors', async () => {
      const args = { start: 0, qt: 2 };
      Project.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(getProjects(args)).rejects.toThrow('Database error');
    });
  });

  describe('addMilestone', () => {
    it('should add a milestone to the project', async () => {
      const projectId = 'projectId123';
      const milestoneData = { name: 'Milestone 1' };
      const mockProject = {
        _id: projectId,
        name: 'Project',
        milestones: [],
        save: jest.fn().mockResolvedValue({ _id: projectId, name: 'Project', milestones: [milestoneData] })
      };
      const mockMember = { owner: 'member123' };
  
      Project.findById.mockResolvedValue(mockProject);
      MemberService.getMemberById.mockResolvedValue(mockMember);
      ActivityHistoryService.createActivityHistory.mockResolvedValue({});
  
      const result = await addMilestone(projectId, milestoneData);
  
      expect(Project.findById).toHaveBeenCalledWith(projectId);
      expect(mockProject.milestones).toContainEqual(milestoneData);
      expect(mockProject.save).toHaveBeenCalled();
      expect(ActivityHistoryService.createActivityHistory).toHaveBeenCalledWith(
        mockMember.owner,
        'milestone_add_to_project',
        expect.any(Object)
      );
  
      // Make sure the result includes milestones and other properties
      expect(result).toEqual({ _id: projectId, name: 'Project', milestones: [milestoneData] });
    });
  
    it('should throw an error if project is not found', async () => {
      const projectId = 'invalidId';
      Project.findById.mockResolvedValue(null);
  
      await expect(addMilestone(projectId, {})).rejects.toThrow('Project not found');
    });
  });
  

  describe('removeMilestone', () => {
    it('should remove a milestone from the project', async () => {
      const projectId = 'projectId123';
      const milestoneId = 'milestoneId123';
      const mockProject = { _id: projectId, name: 'Project', owner: 'ownerId', milestones: [] };
      const mockMember = { owner: 'member123' };

      Project.findByIdAndUpdate.mockResolvedValue(mockProject);
      MemberService.getMemberById.mockResolvedValue(mockMember);
      ActivityHistoryService.createActivityHistory.mockResolvedValue({});

      const result = await removeMilestone(projectId, milestoneId);

      expect(Project.findByIdAndUpdate).toHaveBeenCalledWith(
        projectId,
        { $pull: { milestones: { _id: milestoneId } } },
        { new: true }
      );
      expect(ActivityHistoryService.createActivityHistory).toHaveBeenCalledWith(
        mockMember.owner,
        'milestone_removed',
        expect.any(Object)
      );
      expect(result).toEqual(mockProject);
    });

    it('should throw an error if project is not found', async () => {
      const projectId = 'invalidId';
      Project.findByIdAndUpdate.mockResolvedValue(null);

      await expect(removeMilestone(projectId, 'milestoneId')).rejects.toThrow('Project not found');
    });
  });

  describe('updateProjectStatus', () => {
    it('should update the project status', async () => {
      const projectId = 'projectId123';
      const newStatus = 'Active';
      const mockProject = { _id: projectId, name: 'Test Project', status: 'In Progress' };
      const mockMember = { owner: 'ownerId' };

      Project.findByIdAndUpdate.mockResolvedValue(mockProject);
      MemberService.getMemberById.mockResolvedValue(mockMember);
      ActivityHistoryService.createActivityHistory.mockResolvedValue({});

      const result = await updateProjectStatus(projectId, newStatus);

      expect(Project.findByIdAndUpdate).toHaveBeenCalledWith(
        projectId,
        { status: newStatus },
        { new: true }
      );
      expect(ActivityHistoryService.createActivityHistory).toHaveBeenCalledWith(
        mockMember.owner,
        'project_status_updated',
        expect.any(Object)
      );
      expect(result).toEqual(mockProject);
    });

    it('should throw an error if status is invalid', async () => {
      await expect(updateProjectStatus('projectId123', 'InvalidStatus')).rejects.toThrow('Invalid status');
    });

    it('should throw an error if project is not found', async () => {
      const projectId = 'invalidId';
      Project.findByIdAndUpdate.mockResolvedValue(null);

      await expect(updateProjectStatus(projectId, 'Active')).rejects.toThrow('Project not found');
    });
  });

  describe('getTopSectors', () => {
    it('should return the top 5 sectors with their percentages', async () => {
      const mockSectors = [
        { _id: 'Tech', count: 10 },
        { _id: 'Finance', count: 8 },
        { _id: 'Health', count: 5 },
      ];
      const totalProjects = 30;

      Project.countDocuments.mockResolvedValue(totalProjects);
      Project.aggregate.mockResolvedValue(mockSectors);

      const result = await getTopSectors();

      expect(Project.aggregate).toHaveBeenCalledWith([
        { $group: { _id: '$sector', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { sector: '$_id', _id: 0, count: 1, percentage: { $multiply: [{ $divide: ['$count', totalProjects] }, 100] } } },
      ]);
      expect(result).toEqual(mockSectors);
    });
  });

  // Other tests (deleteProject, countProjectsByMember, countProjectsByMemberId) can follow a similar pattern
});
