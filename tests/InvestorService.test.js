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
      ];

      // Mock countDocuments
      Investor.countDocuments.mockResolvedValueOnce(totalCount);

      // Mock full query chain
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValueOnce(investors),
      };

      Investor.find.mockReturnValue(mockQuery);

      // Appel réel de la méthode
      const result = await InvestorService.getAllInvestors(args);

      // Vérifications
      expect(Investor.countDocuments).toHaveBeenCalled();
      // expect(Investor.find).toHaveBeenCalledWith();
      // expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.populate).toHaveBeenCalled();
      expect(mockQuery.skip).toHaveBeenCalledWith((args.page - 1) * args.pageSize);
      expect(mockQuery.limit).toHaveBeenCalledWith(args.pageSize);

      expect(result).toEqual({ investors, totalPages });
    });
  });
});
