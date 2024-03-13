const { approveUser } = require('../services/UserService');
const requestServive = require('../services/RequestService');
const MemberService = require('../services/MemberService');
const PartnerService = require('../services/PartnerService');
const InvestorService = require('../services/InvestorService');
const User = require('../models/User');

jest.mock('../services/RequestService');
jest.mock('../services/MemberService');
jest.mock('../services/PartnerService');
jest.mock('../services/InvestorService');
jest.mock('../models/User');

describe('UserService', () => {
  describe('approveUser', () => {
    it('should approve a user with role "member"', async () => {
      const id = 'user-id';
      const role = 'member';
      const request = { rc_ice: '123456' };

      User.findById.mockResolvedValueOnce(true);
      requestServive.getRequestByUserId.mockResolvedValueOnce(request);

      await approveUser(id, role);

      expect(MemberService.CreateMember).toHaveBeenCalledWith({ owner: id, rc_ice: request.rc_ice });
      expect(requestServive.removeRequestByUserId).toHaveBeenCalledWith(id, role);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(id, { status: 'accepted' });
    });

    it('should approve a user with role "partner"', async () => {
      const id = 'user-id';
      const role = 'partner';
      const request = { num_rc: '789012' };

      User.findById.mockResolvedValueOnce(true);
      requestServive.getRequestByUserId.mockResolvedValueOnce(request);

      await approveUser(id, role);

      expect(PartnerService.CreatePartner).toHaveBeenCalledWith({ owner: id, num_rc: request.num_rc });
      expect(requestServive.removeRequestByUserId).toHaveBeenCalledWith(id, role);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(id, { status: 'accepted' });
    });

    it('should approve a user with role "investor"', async () => {
      const id = 'user-id';
      const role = 'investor';
      const request = { linkedin_link: 'https://linkedin.com/in/user' };

      User.findById.mockResolvedValueOnce(true);
      requestServive.getRequestByUserId.mockResolvedValueOnce(request);

      await approveUser(id, role);

      expect(InvestorService.CreateInvestor).toHaveBeenCalledWith({ owner: id, linkedin_link: request.linkedin_link });
      expect(requestServive.removeRequestByUserId).toHaveBeenCalledWith(id, role);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(id, { status: 'accepted' });
    });

    it('should throw an error if user does not exist', async () => {
      const id = 'user-id';
      const role = 'member';

      User.findById.mockResolvedValueOnce(false);

      await expect(approveUser(id, role)).rejects.toThrow('User doesn\'t exist!');
    });

    it('should throw an error if request is not found', async () => {
      const id = 'user-id';
      const role = 'member';

      User.findById.mockResolvedValueOnce(true);
      requestServive.getRequestByUserId.mockResolvedValueOnce(null);

      await expect(approveUser(id, role)).rejects.toThrow('Request not found!');
    });
  });
});