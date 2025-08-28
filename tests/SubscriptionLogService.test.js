const SubscriptionLogs = require('../models/SubscriptionLogs');
const { getAllSubscriptionLogs } = require('../services/SubscriptionLogService');

// Mock the SubscriptionLogs model
jest.mock('../models/SubscriptionLogs');

describe('getAllSubscriptionLogs', () => {
  it('should return all subscription logs sorted by subscription date in descending order', async () => {
    const mockLogs = [
      {
        _id: '1',
        subscriptionDate: new Date('2022-01-01'),
        user: { _id: '1', email: 'user1@example.com' },
        subscriptionId: { _id: '1', name: 'Subscription 1', price: 10, duration: 30 }
      },
      {
        _id: '2',
        subscriptionDate: new Date('2022-02-01'),
        user: { _id: '2', email: 'user2@example.com' },
        subscriptionId: { _id: '2', name: 'Subscription 2', price: 20, duration: 60 }
      }
    ];

    // Création d'une fausse query mongoose chaînable
    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(mockLogs) // populate renvoie le résultat final
    };

    SubscriptionLogs.find.mockReturnValue(mockQuery);

    const args = { start: 0, qt: 8 };

    const result = await getAllSubscriptionLogs(args);

    expect(result).toEqual(mockLogs);
    expect(SubscriptionLogs.find).toHaveBeenCalledWith();
    expect(mockQuery.sort).toHaveBeenCalledWith({ subscriptionDate: 'desc' });
    expect(mockQuery.populate).toHaveBeenCalledWith([{ path: 'user' }, { path: 'subscriptionId'}]);
    expect(mockQuery.skip).toHaveBeenCalledWith(args.start);
    expect(mockQuery.limit).toHaveBeenCalledWith(args.qt);
  });
});

