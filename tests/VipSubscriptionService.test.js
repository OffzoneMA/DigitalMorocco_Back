const VipSubscriptionService = require('../services/VipSubscriptionService');
const VipSubscription = require('../models/VipSubscription');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { Types } = require('mongoose');

jest.mock('../models/VipSubscription');
jest.mock('../models/User');
jest.mock('../models/Subscription');

describe('VipSubscriptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  describe('unsubscribe', () => {
    it('should successfully unsubscribe from a VIP service', async () => {
      const userId = new Types.ObjectId();
      const serviceType = 'VIP_NEWSLETTER';
      const mockVipSubscription = {
        active: true,
        save: jest.fn().mockResolvedValue(true)
      };

      VipSubscription.findOne.mockResolvedValue(mockVipSubscription);

      const result = await VipSubscriptionService.unsubscribe(userId, serviceType);

      expect(result.active).toBe(false);
      expect(result.unsubscribedAt).toBeDefined();
      expect(VipSubscription.findOne).toHaveBeenCalledWith({
        user: userId,
        serviceType,
        active: true
      });
    });

  });

  describe('getSubscriptionByUserId', () => {
    it('should return subscription by user ID', async () => {
      const userId = new Types.ObjectId();
      const mockSubscription = { _id: new Types.ObjectId(), user: userId };

      VipSubscription.findOne.mockResolvedValue(mockSubscription);

      const result = await VipSubscriptionService.getSubscriptionByUserId(userId);
      expect(result).toEqual(mockSubscription);
      expect(VipSubscription.findOne).toHaveBeenCalledWith({ user: userId });
    });
  });

  describe('getSubscriptionById', () => {
    it('should return subscription by ID', async () => {
      const subId = new Types.ObjectId();
      const mockSubscription = { _id: subId };

      VipSubscription.findById.mockResolvedValue(mockSubscription);

      const result = await VipSubscriptionService.getSubscriptionById(subId);
      expect(result).toEqual(mockSubscription);
      expect(VipSubscription.findById).toHaveBeenCalledWith(subId);
    });
  });

  describe('getAllActiveSubscriptionsByServiceType', () => {
    it('should return active subscriptions by service type', async () => {
      const serviceType = 'VIP_NEWSLETTER';
      const mockSubscriptions = [
        { _id: new Types.ObjectId(), serviceType, active: true }
      ];
  
      VipSubscription.find.mockResolvedValue(mockSubscriptions);
  
      const result = await VipSubscriptionService.getAllActiveSubscriptionsByServiceType(serviceType);
      
      expect(result).toEqual(mockSubscriptions);
      expect(VipSubscription.find).toHaveBeenCalledWith({
        serviceType,
        active: true,
        nextBillingDate: { $gt: expect.any(Number) }, // Changed from Date to Number
        paymentStatus: 'PAID'
      });
    });
  
    it('should throw error when retrieval fails', async () => {
      VipSubscription.find.mockRejectedValue(new Error('Unable to retrieve active subscriptions by service type'));
      await expect(VipSubscriptionService.getAllActiveSubscriptionsByServiceType('VIP_NEWSLETTER'))
        .rejects.toThrow('Unable to retrieve active subscriptions by service type');
    });
  });

  describe('getAllActiveSubscriptions', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return all active subscriptions', async () => {
      // Préparer des dates fixes
      const fixedDate1 = new Date('2025-08-01T12:35:39.561Z');
      const fixedDate2 = new Date('2025-08-02T12:35:39.562Z');
      const mockSubscriptions = [
        { 
          _id: new Types.ObjectId('688b631b41bce7877098b36a'), 
          active: true,
          nextBillingDate: fixedDate1,
          paymentStatus: 'PAID'
        },
        { 
          _id: new Types.ObjectId('688b631b41bce7877098b36b'), 
          active: true,
          nextBillingDate: fixedDate2,
          paymentStatus: 'PAID'
        }
      ];
  
      // Configurer le mock pour retourner un tableau via exec()
      VipSubscription.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockSubscriptions)
      });
  
      // Appeler la méthode
      const result = await VipSubscriptionService.getAllActiveSubscriptions();
  
      // Vérifier les résultats
      expect(result).toEqual(mockSubscriptions);
    });
  
    it('should throw error when retrieval fails', async () => {
      // Configurer le mock pour simuler une erreur
      VipSubscription.find.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error('Unable to retrieve active subscriptions.'))
      });
  
      // Vérifier que l'erreur est bien levée
      await expect(VipSubscriptionService.getAllActiveSubscriptions())
        .rejects.toThrow('Unable to retrieve active subscriptions.');
    });
  });
  

});