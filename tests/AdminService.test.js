const bcrypt = require('bcrypt');
const User = require('../models/User');
const { createAdmin } = require('../services/AdminService');

jest.mock('bcrypt');
jest.mock('../models/User');

describe('AdminService', () => {
  describe('createAdmin', () => {
    it('should create an admin with hashed password and default role and status', async () => {
      const u = {
        password: 'password123',
      };
      const hashedPassword = 'hashedPassword123';
      const createdUser = { id: 'user-id', role: 'Admin', status: 'accepted' };

      bcrypt.hash.mockResolvedValueOnce(hashedPassword);
      User.create.mockResolvedValueOnce(createdUser);

      const result = await createAdmin(u);

      expect(bcrypt.hash).toHaveBeenCalledWith(u.password, salt);
      expect(User.create).toHaveBeenCalledWith({
        password: hashedPassword,
        role: 'Admin',
        status: 'accepted',
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw an error if email is already in use', async () => {
      const u = {
        password: 'password123',
      };

      bcrypt.hash.mockResolvedValueOnce('hashedPassword123');
      User.create.mockRejectedValueOnce(new Error('Email Already in Use'));

      await expect(createAdmin(u)).rejects.toThrow('Email Already in Use');
    });
  });
});