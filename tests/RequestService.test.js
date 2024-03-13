const { createRequest } = require('../services/RequestService');
const Investor = require('../models/Investor');
const Partner = require('../models/Partner');
const Member = require('../models/Member');
const User = require('../models/User');
const uploadService = require('../services/uploadService');

jest.mock('../services/uploadService');

describe('RequestService', () => {
  describe('createRequest', () => {
    it('should create a request for an investor', async () => {
      const data = { linkedin_link: 'https://linkedin.com/in/example' };
      const id = 'user1';
      const role = 'investor';

      Investor.create = jest.fn().mockResolvedValue({ _id: 'investor1' });
      User.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'user1' });

      const result = await createRequest(data, id, role);

      expect(Investor.create).toHaveBeenCalledWith({ linkedin_link: 'https://linkedin.com/in/example', user: 'user1' });
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user1', { status: 'pending', role });

      expect(result).toEqual({ _id: 'user1' });
    });

    it('should create a request for a partner', async () => {
      const data = { num_rc: '123456789' };
      const id = 'user2';
      const role = 'partner';

      Partner.create = jest.fn().mockResolvedValue({ _id: 'partner1' });
      User.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'user2' });

      const result = await createRequest(data, id, role);

      expect(Partner.create).toHaveBeenCalledWith({ num_rc: '123456789', user: 'user2' });
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user2', { status: 'pending', role });

      expect(result).toEqual({ _id: 'user2' });
    });

    it('should create a request for a member with a file', async () => {
      const data = {};
      const id = 'user3';
      const role = 'member';
      const file = 'file1';

      Member.create = jest.fn().mockResolvedValue({ _id: 'member1' });
      uploadService.uploadFile = jest.fn().mockResolvedValue('fileLink');
      Member.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'member1' });
      User.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'user3' });

      const result = await createRequest(data, id, role, file);

      expect(Member.create).toHaveBeenCalledWith({ user: 'user3' });
      expect(uploadService.uploadFile).toHaveBeenCalledWith('file1', 'Members/user3', 'rc_ice');
      expect(Member.findByIdAndUpdate).toHaveBeenCalledWith('member1', { rc_ice: 'fileLink' });
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user3', { status: 'pending', role });

      expect(result).toEqual({ _id: 'user3' });
    });

    it('should throw an error if file is not provided for a member', async () => {
      const data = {};
      const id = 'user4';
      const role = 'member';
      const file = null;

      expect(async () => {
        await createRequest(data, id, role, file);
      }).rejects.toThrow('File required');
    });
  });
});