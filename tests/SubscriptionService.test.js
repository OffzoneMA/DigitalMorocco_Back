const Subscription = require('../models/Subscription');
const { getSubscriptionById } = require('../services/SubscriptionService');

// Mock the Subscription model
jest.mock('../models/Subscription');

describe('getSubscriptionById', () => {
  it('should return the subscription with the given id', async () => {
    // Arrange
    const subscriptionId = '123456789';
    const expectedSubscription = { id: subscriptionId, name: 'Gold' };
    Subscription.findById.mockResolvedValue(expectedSubscription);

    // Act
    const result = await getSubscriptionById(subscriptionId);

    // Assert
    expect(result).toEqual(expectedSubscription);
    expect(Subscription.findById).toHaveBeenCalledWith(subscriptionId);
  });

  it('should return null if no subscription is found', async () => {
    // Arrange
    const subscriptionId = '987654321';
    Subscription.findById.mockResolvedValue(null);

    // Act
    const result = await getSubscriptionById(subscriptionId);

    // Assert
    expect(result).toBeNull();
    expect(Subscription.findById).toHaveBeenCalledWith(subscriptionId);
  });

  it('should throw an error if an exception occurs', async () => {
    // Arrange
    const subscriptionId = '123456789';
    const expectedError = new Error('Database error');
    Subscription.findById.mockRejectedValue(expectedError);

    // Act & Assert
    await expect(getSubscriptionById(subscriptionId)).rejects.toThrow(expectedError);
    expect(Subscription.findById).toHaveBeenCalledWith(subscriptionId);
  });
});