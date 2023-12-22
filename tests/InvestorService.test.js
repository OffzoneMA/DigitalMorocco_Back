const InvestorService = require('../services/InvestorService');
const Investor = require('../models/Investor');

jest.mock('../models/Investor');

describe('InvestorService', () => {
  describe('getAllInvestors', () => {
    it('should return all investors with pagination', async () => {
      const args = {
        page: 1,
        pageSize: 10,
      };
      const totalCount = 20;
      const totalPages = 2;
      const investors = [
        { _id: '1', owner: 'user1', linkedin_link: 'https://linkedin.com/in/user1' },
        { _id: '2', owner: 'user2', linkedin_link: 'https://linkedin.com/in/user2' },
        // ... more investor objects
      ];

      Investor.countDocuments.mockResolvedValueOnce(totalCount);
      Investor.find.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValueOnce(investors),
      });

      const result = await InvestorService.getAllInvestors(args);

      expect(Investor.countDocuments).toHaveBeenCalled();
      expect(Investor.find).toHaveBeenCalledWith();
      expect(result).toEqual({ investors, totalPages });
    });
  });
});