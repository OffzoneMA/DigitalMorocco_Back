const MemberService = require('../services/MemberService');
const Member = require('../models/Member');
const User = require('../models/User');
const Project = require('../models/Project');
const Investor = require('../models/Investor');
const uploadService = require('../services/FileService');
const ContactRequest = require('../models/ContactRequest');
const { Types } = require('mongoose');

// Mock des dépendances
jest.mock('../models/Member');
jest.mock('../models/User');
jest.mock('../models/Project');
jest.mock('../models/Investor');
jest.mock('../models/ContactRequest');
jest.mock('../services/FileService.js');
jest.mock('../services/ActivityHistoryService');

describe('MemberService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllMembers', () => {
    it('should return paginated members with filters', async () => {
      const mockMembers = [
        { _id: '1', companyName: 'Company A' },
        { _id: '2', companyName: 'Company B' }
      ];
      
      // Mock the countDocuments query
      Member.countDocuments.mockImplementation((query) => {
        // Verify the query structure
        expect(query).toEqual({
          companyName: { $exists: true },
          visbility: 'public',
          country: { $in: ['US', 'FR'] },
          companyType: { $in: ['Tech', 'Finance'] },
          stage: { $in: ['Seed', 'SeriesA'] }
        });
        return Promise.resolve(2);
      });
  
      // Mock the find query chain
      const mockFind = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockMembers)
      };
      Member.find.mockImplementation((query) => {
        // Verify the query structure
        expect(query).toEqual({
          companyName: { $exists: true },
          visbility: 'public',
          country: { $in: ['US', 'FR'] },
          companyType: { $in: ['Tech', 'Finance'] },
          stage: { $in: ['Seed', 'SeriesA'] }
        });
        return mockFind;
      });
  
      const args = {
        page: 1,
        pageSize: 10,
        countries: 'US,FR',
        sectors: 'Tech,Finance',
        stages: 'Seed,SeriesA'
      };
  
      const result = await MemberService.getAllMembers(args);
      
      expect(result.members).toEqual(mockMembers);
      expect(result.totalPages).toBe(1);
      
      // Verify the query chain was called correctly
      expect(mockFind.skip).toHaveBeenCalledWith(0);
      expect(mockFind.limit).toHaveBeenCalledWith(10);
      expect(mockFind.select).toHaveBeenCalledWith('_id companyName website logo desc companyType country');
    });
  
    it('should handle errors and throw "Something went wrong"', async () => {
      Member.countDocuments.mockRejectedValue(new Error('DB error'));
      
      const args = {
        page: 1,
        pageSize: 10
      };
  
      await expect(MemberService.getAllMembers(args))
        .rejects.toThrow('Something went wrong');
    });
  });

  describe('createEnterprise', () => {
    it('should create enterprise with documents and logo', async () => {
      const memberId = new Types.ObjectId();
      const mockMember = { _id: memberId, owner: 'user123' };
      const mockFile = { originalname: 'doc.pdf' };
      const mockLogo = { originalname: 'logo.jpg' };
      
      Member.findById.mockResolvedValue(mockMember);
      uploadService.uploadFile.mockResolvedValue('http://example.com/file');
      Member.findByIdAndUpdate.mockResolvedValue({ _id: memberId });

      const result = await MemberService.createEnterprise(
        memberId, 
        { companyName: 'Test' }, 
        [mockFile], 
        [mockLogo]
      );

      expect(result).toBeDefined();
      expect(uploadService.uploadFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('createProject', () => {
    it('should create project with documents', async () => {
      const ownerId = new Types.ObjectId();
      const mockProject = { _id: 'proj123', save: jest.fn().mockResolvedValue(true) };
      const mockFile = { originalname: 'pitch.pdf' };
      
      Member.findById.mockResolvedValue({ _id: ownerId });
      uploadService.uploadFile.mockResolvedValue('http://example.com/file');
      Project.mockImplementation(() => mockProject);

      const result = await MemberService.createProject(
        ownerId,
        { name: 'Test Project' },
        mockFile,
        null,
        null,
        [mockFile],
        null
      );

      expect(result).toBeDefined();
      expect(mockProject.save).toHaveBeenCalled();
    });
  });

  describe('updateProject', () => {
    it('should update project with new documents', async () => {
      const projectId = new Types.ObjectId();
      const mockProject = { 
        _id: projectId, 
        owner: 'user123',
        documents: [],
        save: jest.fn().mockResolvedValue(true)
      };
      
      Project.findById.mockResolvedValue(mockProject);
      uploadService.uploadFile.mockResolvedValue('http://example.com/file');

      const result = await MemberService.updateProject(
        projectId,
        { name: 'Updated Project' },
        null,
        null,
        null,
        [{ originalname: 'new.pdf' }],
        null
      );

      expect(result).toBeDefined();
      expect(mockProject.save).toHaveBeenCalled();
    });
  });

  describe('getInvestorsForMember', () => {
    it('should handle empty results', async () => {
      const memberId = new Types.ObjectId();
      
      // Mock the complete query chain
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]) ,
        select: jest.fn().mockResolvedValue([])
      };
      
      ContactRequest.find.mockImplementation(() => mockQuery);
      ContactRequest.countDocuments.mockResolvedValue(0);

      Investor.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([{ _id: 'id1' }, { _id: 'id2' }]),
      });      
  
      const result = await MemberService.getInvestorsForMember(memberId, {
        page: 1,
        pageSize: 10
      });
  
      expect(result.investors).toEqual([]);
      expect(result.totalPages).toBe(0);
      expect(result.currentPage).toBe(1);
  
      // Verify the query was built correctly
      expect(mockQuery.populate).toHaveBeenCalledWith({
        path: 'investor',
        model: 'Investor'
      });
      expect(mockQuery.sort).toHaveBeenCalledWith({ dateCreated: 'desc' });
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });
  });

  describe('getContactRequestsForMember', () => {
    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      // exec: jest.fn(),
    };
  
    beforeEach(() => {
      jest.clearAllMocks();
      ContactRequest.find.mockImplementation(() => mockQuery);
    });
  
    it('should return contact requests and total count', async () => {
      const fakeContactRequests = [
        { _id: 'req1', investor: { firstName: 'John' }, member: { firstName: 'Jane' } },
      ];

      ContactRequest.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeContactRequests),
      });

      ContactRequest.countDocuments.mockResolvedValueOnce(1);    // pour count
  
      const result = await MemberService.getContactRequestsForMember('member123', {
        page: 1,
        pageSize: 10,
        start: 0,
        qt: 10,
      });
  
      expect(ContactRequest.find).toHaveBeenCalledWith({
        isDeleted: false,
        'investor._id': 'member123',
      });
  
      expect(mockQuery.populate).toHaveBeenCalledWith('investor', 'firstName lastName');
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
  
      expect(result).toEqual({
        data: fakeContactRequests,
        total: 1,
      });
    });
  
    it('should handle empty results', async () => {
      mockQuery.exec.mockResolvedValueOnce([]); // aucun contact
      ContactRequest.countDocuments.mockResolvedValueOnce(0);
  
      const result = await MemberService.getContactRequestsForMember({
        memberId: 'member123',
        start: 0,
        qt: 10,
      });
  
      expect(result).toEqual({
        data: [],
        total: 0,
      });
    });
  
    it('should throw error if ContactRequest.find fails', async () => {
      const error = new Error('DB error');
      mockQuery.exec.mockRejectedValueOnce(error);
  
      await expect(
        MemberService.getContactRequestsForMember({
          memberId: 'member123',
          start: 0,
          qt: 10,
        })
      ).rejects.toThrow('DB error');
    });
  });

  describe('deleteMember', () => {
    it('should delete member and related data', async () => {
      const userId = new Types.ObjectId();
      const mockMember = { _id: 'member123', owner: userId };
      
      Member.findOne.mockResolvedValue(mockMember);
      ContactRequest.deleteMany.mockResolvedValue(true);
      Investor.updateMany.mockResolvedValue(true);
      SubscriptionLogs.deleteMany.mockResolvedValue(true);
      Project.deleteMany.mockResolvedValue(true);
      uploadService.deleteFolder.mockResolvedValue(true);

      await MemberService.deleteMember(userId);
      
      expect(Member.findByIdAndDelete).toHaveBeenCalledWith('member123');
      expect(uploadService.deleteFolder).toHaveBeenCalledTimes(3);
    });
  });

  describe('checkMemberStatus', () => {
    it('should return true for active member', async () => {
      const memberId = new Types.ObjectId();
      Member.findOne.mockResolvedValue({ _id: memberId, subStatus: 'active' });
      
      const result = await MemberService.checkMemberStatus(memberId);
      expect(result).toBe(true);
    });

    it('should return false for inactive member', async () => {
      Member.findOne.mockResolvedValue(null);
      const result = await MemberService.checkMemberStatus('invalid');
      expect(result).toBe(false);
    });
  });

  // Tests supplémentaires pour les autres fonctions
  describe('getMemberByUserId', () => {
    it('should return member by user ID', async () => {
      const userId = new Types.ObjectId();
      const mockMember = { _id: 'member123', owner: userId };
      
      Member.findOne.mockResolvedValue(mockMember);
      
      const result = await MemberService.getMemberByUserId(userId);
      expect(result).toEqual(mockMember);
    });
  });

  describe('createOrUpdateMember', () => {
    it('should update existing member with logo', async () => {
      const userId = new Types.ObjectId();
      const mockMember = { 
        _id: 'member123', 
        owner: userId,
        save: jest.fn().mockResolvedValue(true)
      };
      const mockLogo = { originalname: 'logo.jpg' };
      
      Member.findOne.mockResolvedValue(mockMember);
      uploadService.uploadFile.mockResolvedValue('http://example.com/logo.jpg');

      const result = await MemberService.createOrUpdateMember(
        userId,
        { companyName: 'Updated' },
        mockLogo
      );
      
      expect(result.message).toContain('Membre mis à jour');
      expect(mockMember.save).toHaveBeenCalled();
    });
  });

  describe('deleteCompanyLogo', () => {
    it('should delete company logo for member', async () => {
      const userId = new Types.ObjectId();
      const mockUser = { _id: userId, role: 'member' };
      const mockMember = { 
        _id: 'member123', 
        owner: userId,
        companyName: 'Test',
        logo: 'http://example.com/logo.jpg',
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findById.mockResolvedValue(mockUser);
      Member.findOne.mockResolvedValue(mockMember);
      uploadService.extractPathAndFilename.mockReturnValue(['path', 'logo.jpg']);
      uploadService.deleteFile.mockResolvedValue(true);

      const result = await MemberService.deleteCompanyLogo(userId);
      
      expect(result.success).toBe(true);
      expect(mockMember.logo).toBeNull();
    });
  });
});