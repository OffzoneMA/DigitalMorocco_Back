const UserService = require('../services/UserService');
const User = require('../models/User');
const Member = require('../models/Member');
const Partner = require('../models/Partner');
const Investor = require('../models/Investor');
const UserLog = require('../models/UserLog');
const requestServive = require('../services/RequestService');
const FileService = require('../services/FileService');
const EmailingService = require('../services/EmailingService');
const ActivityHistoryService = require('../services/ActivityHistoryService');
const bcrypt = require('bcrypt');
const { Types } = require('mongoose');

// Mock des dépendances
jest.mock('../models/User');
jest.mock('../models/Member');
jest.mock('../models/Partner');
jest.mock('../models/Investor');
jest.mock('../models/UserLog');
jest.mock('bcrypt');
jest.mock('../services/MemberService');
jest.mock('../services/PartnerService');
jest.mock('../services/InvestorService');
jest.mock('../services/RequestService');
jest.mock('../services/FileService');
jest.mock('../services/EmailingService');
jest.mock('../services/ActivityHistoryService');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return users with pagination', async () => {
      const mockUsers = [{ _id: '1', name: 'User1' }, { _id: '2', name: 'User2' }];
      User.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockUsers)
      });

      const result = await UserService.getUsers({ start: 0, qt: 10 });
      expect(result).toEqual(mockUsers);
      expect(User.find).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete user and related data', async () => {
      const userId = new Types.ObjectId();
      User.findById.mockResolvedValue({ _id: userId, role: 'member' });
      
      await UserService.deleteUser(userId);
      
      expect(User.deleteOne).toHaveBeenCalledWith({ _id: userId });
      expect(UserLog.deleteMany).toHaveBeenCalledWith({ owner: userId });
    });
  });

  describe('updateUser', () => {
    it('should update user with hashed password', async () => {
      const userId = new Types.ObjectId();
      const userData = { password: 'newpass' };
      const hashedPass = 'hashedpass';
      
      bcrypt.hash.mockResolvedValue(hashedPass);
      User.findByIdAndUpdate.mockResolvedValue({ _id: userId, password: hashedPass });

      const result = await UserService.updateUser(userId, userData);
      
      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { password: hashedPass },
        { new: true, runValidators: true }
      );
    });
  });

  describe('getUserByID', () => {
    it('should return user with subscription', async () => {
      const userId = new Types.ObjectId();
      const mockUser = { _id: userId, name: 'Test User' };
      
      User.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser)
      });

      const result = await UserService.getUserByID(userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      User.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      });

      await expect(UserService.getUserByID('invalid'))
        .rejects.toThrow('User not found');
    });
  });

  describe('approveUserService', () => {
    it('should approve member user', async () => {
      const userId = new Types.ObjectId();
      const mockRequest = { rc_ice: '123' };
      
      User.findById.mockResolvedValue({ _id: userId });
      requestServive.getRequestByUserId.mockResolvedValue(mockRequest);
      User.findByIdAndUpdate.mockResolvedValue({ _id: userId, status: 'accepted' });

      const result = await UserService.approveUserService(userId, 'member');
      
      expect(Member.create).toHaveBeenCalledWith({ owner: userId, rc_ice: '123' });
      expect(result.status).toBe('accepted');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const token = 'valid-token';
      const mockUser = { _id: '1', password: 'old' };
      
      EmailingService.verifyResetToken.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue('new-hashed');
      User.findByIdAndUpdate.mockResolvedValue(true);

      await UserService.resetPassword(token, 'newpass', 'newpass', 'en');
      
      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
      expect(ActivityHistoryService.createActivityHistory).toHaveBeenCalled();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile with image', async () => {
      const userId = new Types.ObjectId();
      const mockFile = { originalname: 'test.jpg' };
      const mockUser = { _id: userId, save: jest.fn().mockResolvedValue(true) };
      
      User.findById.mockResolvedValue(mockUser);
      FileService.uploadFile.mockResolvedValue('http://image.url');

      await UserService.updateUserProfile(userId, { name: 'New' }, mockFile);
      
      expect(FileService.uploadFile).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('countUsersByMonth', () => {
    it('should return monthly counts', async () => {
      const currentYear = new Date().getFullYear();
      User.countDocuments.mockResolvedValue(5);

      const result = await UserService.countUsersByMonth();
      
      expect(result.year).toBe(currentYear);
      expect(result.monthlyCounts).toHaveLength(12);
    });
  });
});