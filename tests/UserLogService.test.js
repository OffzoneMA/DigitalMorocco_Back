const UserLog = require('../models/UserLog'); // Assuming you have a UserLog model defined
const { getAllUsersLogsByUser } = require('../services/UserLogService');

describe('UserLogService', () => {
  describe('getAllUsersLogsByUser', () => {
    it('should return all user logs for a given user', async () => {
      // Mock the UserLog.find method to return a predefined set of logs
      UserLog.find = jest.fn().mockResolvedValue([
        { _id: 'log1', owner: 'user1', envStatus: 'dev', dateCreated: new Date() },
        { _id: 'log2', owner: 'user1', envStatus: 'prod', dateCreated: new Date() },
        { _id: 'log3', owner: 'user1', envStatus: null, dateCreated: new Date() }
      ]);

      // Mock the args object with start and qt properties
      const args = { start: 0, qt: 10 };

      // Call the getAllUsersLogsByUser function
      const result = await getAllUsersLogsByUser('user1', args);

      // Assert that the UserLog.find method was called with the correct parameters
      expect(UserLog.find).toHaveBeenCalledWith({
        owner: 'user1',
        $or: [
          { envStatus: 'dev' },
          { envStatus: null }
        ]
      });

      // Assert that the result is an array of logs
      expect(result).toEqual([
        { _id: 'log1', owner: 'user1', envStatus: 'dev', dateCreated: expect.any(Date) },
        { _id: 'log2', owner: 'user1', envStatus: 'prod', dateCreated: expect.any(Date) },
        { _id: 'log3', owner: 'user1', envStatus: null, dateCreated: expect.any(Date) }
      ]);
    });
  });
});