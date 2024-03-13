const SubscriptionLogs = require('../models/SubscriptionLogs');
const { getAllSubscriptionLogs } = require('../services/SubscriptionLogService');

// Mock the SubscriptionLogs model
jest.mock('../models/SubscriptionLogs');

describe('getAllSubscriptionLogs', () => {
  it('should return all subscription logs sorted by subscription date in descending order', async () => {
    // Mock the find method of SubscriptionLogs model to return a sample array of subscription logs
    SubscriptionLogs.find.mockResolvedValue([
      {
        _id: '1',
        subscriptionDate: new Date('2022-01-01'),
        member: { _id: '1', email: 'member1@example.com' },
        subscriptionId: { _id: '1', name: 'Subscription 1', price: 10, duration: 30 }
      },
      {
        _id: '2',
        subscriptionDate: new Date('2022-02-01'),
        member: { _id: '2', email: 'member2@example.com' },
        subscriptionId: { _id: '2', name: 'Subscription 2', price: 20, duration: 60 }
      }
    ]);

    // Mock the populate method of SubscriptionLogs model to populate member and subscriptionId fields
    SubscriptionLogs.populate.mockImplementationOnce((query, options) => {
      query.forEach(log => {
        log.member = { _id: log.member };
        log.subscriptionId = { _id: log.subscriptionId };
      });
      return query;
    });

    // Mock the skip and limit values for pagination
    const args = { start: 0, qt: 8 };

    // Call the getAllSubscriptionLogs function
    const result = await getAllSubscriptionLogs(args);

    // Assert the result
    expect(result).toEqual([
      {
        _id: '2',
        subscriptionDate: new Date('2022-02-01'),
        member: { _id: '2', email: 'member2@example.com' },
        subscriptionId: { _id: '2', name: 'Subscription 2', price: 20, duration: 60 }
      },
      {
        _id: '1',
        subscriptionDate: new Date('2022-01-01'),
        member: { _id: '1', email: 'member1@example.com' },
        subscriptionId: { _id: '1', name: 'Subscription 1', price: 10, duration: 30 }
      }
    ]);

    // Assert that the find method was called with the correct arguments
    expect(SubscriptionLogs.find).toHaveBeenCalledWith();

    // Assert that the populate method was called with the correct arguments
    expect(SubscriptionLogs.populate).toHaveBeenCalledWith(expect.any(Array), [
      { path: 'member', select: '_id email ' },
      { path: 'subscriptionId', select: '_id name price duration' }
    ]);

    // Assert that the skip and limit values were used correctly
    expect(SubscriptionLogs.find).toHaveBeenCalledWith().skip(args.start).limit(args.qt);
  });
});