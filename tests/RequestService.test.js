const { createRequest } = require('../services/RequestService');
const Investor = require('../models/Investor');
const Partner = require('../models/Partner');
const Member = require('../models/Member');
const User = require('../models/User');
const uploadService = require('../services/FileService');
const { Types } = require('mongoose');

jest.mock('../services/FileService');

describe('RequestService', () => {
  // describe('createRequest', () => {

  //   beforeEach(() => {
  //     jest.clearAllMocks();
  //   });

  //   it('should create a request for an investor', async () => {
  //     const data = { linkedin_link: 'https://linkedin.com/in/example' };
  //     const id = new Types.ObjectId();

  //     Investor.create = jest.fn().mockResolvedValue({ _id: id });
  //     User.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: id });

  //     const result = await createRequest(data, id, 'investor');

  //     expect(Investor.create).toHaveBeenCalledWith({ linkedin_link: data.linkedin_link, user: id });
  //     expect(User.findByIdAndUpdate).toHaveBeenCalledWith(id, { status: 'pending', role: 'investor' });
  //     expect(result).toEqual({ _id: id });
  //   });

  //   it('should create a request for a partner', async () => {
  //     const data = { num_rc: '123456789' };
  //     const id = new Types.ObjectId();

  //     Partner.create = jest.fn().mockResolvedValue({ _id: id });
  //     User.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: id });

  //     const result = await createRequest(data, id, 'partner');

  //     expect(Partner.create).toHaveBeenCalledWith({ num_rc: data.num_rc, user: id });
  //     expect(User.findByIdAndUpdate).toHaveBeenCalledWith(id, { status: 'pending', role: 'partner' });
  //     expect(result).toEqual({ _id: id });
  //   }, 10000);
  // });

  // it('should create a request for a member with a file', async () => {
  //   const data = {};
  //   const id = new Types.ObjectId();
  //   const file = 'file1';

  //   Member.create = jest.fn().mockResolvedValue({ _id: id });
  //   // uploadService.uploadFile = jest.fn().mockResolvedValue('fileLink');
  //   // Member.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: id });
  //   // User.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: id });

  //   const result = await createRequest(data, id, 'member', file);

  //   expect(Member.create).toHaveBeenCalledWith({ user: id });
  //   expect(uploadService.uploadFile).toHaveBeenCalledWith(file, `Members/${id}`, 'rc_ice');
  //   expect(Member.findByIdAndUpdate).toHaveBeenCalledWith(id, { rc_ice: 'fileLink' });
  //   expect(User.findByIdAndUpdate).toHaveBeenCalledWith(id, { status: 'pending', role: 'member' });
  //   expect(result).toEqual({ _id: id });
  // });

  it('should throw an error if file is not provided for a member', async () => {
    const data = {};
    const id = new Types.ObjectId();
    const file = null;

    await expect(createRequest(data, id, 'member', file))
      .rejects
      .toThrow('File required');
  });
});