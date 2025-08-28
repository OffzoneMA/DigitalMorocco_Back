const UserLog = require('../models/UserLog'); // Assuming you have a UserLog model defined
const { getAllUsersLogsByUser } = require('../services/UserLogService');

describe('UserLogService', () => {
  describe('getAllUsersLogsByUser', () => {
    it('should return all user logs for a given user', async () => {
      const mockLogs = [
        { _id: 'log1', owner: 'user1', envStatus: 'dev', dateCreated: new Date() },
        { _id: 'log2', owner: 'user1', envStatus: 'prod', dateCreated: new Date() },
        { _id: 'log3', owner: 'user1', envStatus: null, dateCreated: new Date() }
      ];

      // Créer un mock chaînable pour Mongoose
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockLogs)
      };

      // Mock UserLog.find pour retourner le mock chaînable
      UserLog.find = jest.fn().mockReturnValue(mockQuery);

      const args = { start: 0, qt: 10 };

      // Appel de la fonction
      const result = await getAllUsersLogsByUser('user1', args);

      // Vérifications
      expect(UserLog.find).toHaveBeenCalledWith({
        owner: 'user1',
        $or: [
          { envStatus: process.env.NODE_ENV === 'development' ? 'dev' : 'prod' },
          { envStatus: null }
        ]
      });
      expect(mockQuery.sort).toHaveBeenCalledWith({ dateCreated: 'desc' });
      expect(mockQuery.populate).toHaveBeenCalledWith({ path: 'owner', select: '_id email role' });
      expect(mockQuery.skip).toHaveBeenCalledWith(args.start);
      expect(mockQuery.limit).toHaveBeenCalledWith(args.qt);

      expect(result).toEqual(mockLogs);
    });
  });
});
