const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MemberService = require('../services/MemberService');
const PartnerService = require('../services/PartnerService');
const InvestorService = require('../services/InvestorService');
const ProjectService = require('../services/ProjectService');
const EventService = require('../services/EventService');
const AuthService = require('../services/AuthService');
const { signInUser, createUser, generateAccessToken, generateUserInfos, getAllUsers } = require('../services/AuthService');

// Mocking dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../models/User');
jest.mock('../services/MemberService');
jest.mock('../services/PartnerService');
jest.mock('../services/InvestorService');
jest.mock('../services/ProjectService');
jest.mock('../services/EventService');

describe('User Service', () => {
  const mockUser = {
    email: 'test@test.com',
    password: 'password123',
    role: 'Member',
    isDeleted: false,
    save: jest.fn().mockResolvedValue(true),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signInUser', () => {
    it('should sign in a user with correct credentials', async () => {
      const hashedPassword = 'hashedPassword123';
    
      // Mocking User.findOne with chained populate and exec
      const mockFindOne = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ ...mockUser, password: hashedPassword })
      };
      User.findOne.mockReturnValue(mockFindOne);
    
      // Mock bcrypt.compare to return true (password match)
      bcrypt.compare.mockResolvedValue(true);
    
      // Mock the expected result from generateUserInfos
      const mockUserInfo = {
        // accessToken: 'token123',
        user: {
          ...mockUser,
          password: hashedPassword,
          member: { },
          // eventCount: 3
        }
      };
    
      // Mock generateUserInfos in the AuthService
      jest.spyOn(AuthService, 'generateUserInfos').mockResolvedValue(mockUserInfo);
    
      const result = await signInUser({ email: 'test@test.com', password: 'password123' });
    
      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', hashedPassword);
    });
          

    it('should throw an error for incorrect password', async () => {
      User.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser)
      });
      bcrypt.compare.mockResolvedValue(false);

      await expect(signInUser({ email: 'test@test.com', password: 'wrongpassword' })).rejects.toThrow('Incorrect password.');
    });

    it('should throw an error for non-existent email', async () => {
      User.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      });

      await expect(signInUser({ email: 'wrong@test.com', password: 'password123' })).rejects.toThrow('Email not found.');
    });
  });

  describe('createUser', () => {
    const mockUser = {
      email: 'test@test.com',
      password: 'password123',
    };
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should create a new user and return access token', async () => {
      // Mock for no existing user
      User.findOne.mockResolvedValue(null);  
      bcrypt.hash.mockResolvedValue('hashedPassword123'); // Mock for bcrypt.hash
      User.create.mockResolvedValue({ ...mockUser, password: 'hashedPassword123' }); // Mock for User.create
      jwt.sign.mockReturnValue('accessToken123'); // Mock for jwt.sign
  
      const result = await createUser(mockUser);
  
      // Check expected calls
      expect(User.findOne).toHaveBeenCalledWith({ email: mockUser.email.toLowerCase() });
      // expect(bcrypt.hash).toHaveBeenCalledWith(mockUser.password, 10); // Vérifie que bcrypt.hash a bien été appelé avec le mot de passe original
      expect(User.create).toHaveBeenCalledWith({
        ...mockUser,
        password: 'hashedPassword123', // Vérifie que le mot de passe haché est bien utilisé lors de la création
        email: mockUser.email.toLowerCase(),
      });
      expect(result).toEqual({ accessToken: 'accessToken123', user: { ...mockUser, password: 'hashedPassword123' } });
    });
  
    it('should throw an error if email already exists', async () => {
      User.findOne.mockResolvedValue(mockUser); // Mock to simulate existing user
  
      await expect(createUser(mockUser)).rejects.toThrow('User creation failed. Please try again.');
    });
  });

  describe('generateUserInfos', () => {
    it('should generate user infos for a member role', async () => {
      const memberData = { _id: 'member123', name: 'Test Member' };
      MemberService.getMemberByUserId.mockResolvedValue(memberData);
      ProjectService.countProjectsByMemberId.mockResolvedValue(5);
      EventService.countEventsByUserId.mockResolvedValue(3);
      jwt.sign.mockResolvedValue('accessToken123');

      const result = await generateUserInfos(mockUser);

      expect(MemberService.getMemberByUserId).toHaveBeenCalledWith(mockUser._id);
      expect(ProjectService.countProjectsByMemberId).toHaveBeenCalledWith(memberData._id);
      expect(EventService.countEventsByUserId).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual({
        accessToken: 'accessToken123',
        user: {
          ...mockUser,
          member: {
            ...memberData,
            projectCount: 5,
          },
          eventCount: 3,
        },
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return a list of users', async () => {
      const mockUsers = [{ email: 'test1@test.com' }, { email: 'test2@test.com' }];
      User.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockUsers)
      });

      const result = await getAllUsers();

      expect(User.find).toHaveBeenCalledWith({ isDeleted: false });
      expect(result).toEqual(mockUsers);
    });

    it('should handle errors when fetching users', async () => {
      User.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(getAllUsers()).rejects.toThrow('Error getting list of users: Database error');
    });
  });
});
