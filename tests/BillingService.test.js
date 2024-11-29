const Billing = require('../models/Billing');
const uploadService = require('../services/FileService');
const {
  createBillingForUser,
  getBillingByUserId,
  updateBillingStatus,
  getAllBillingsForUser,
  deleteBillingById,
} = require('../services/BillingService');

// Mocking dependencies
jest.mock('../models/Billing');
jest.mock('../services/FileService');

describe('BillingService', () => {
  const userId = 'user123';
  const mockBillingData = {
    amount: 100,
    dueDate: new Date(),
    status: 'Pending',
  };
  const mockDocFile = {
    originalname: 'invoice.pdf',
    mimetype: 'application/pdf',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBillingForUser', () => {
    it('should create a billing for user with document', async () => {
      const mockBillingData = {
        amount: 100,
        dueDate: new Date('2024-10-20T22:03:33.972Z'),
        status: 'Pending',
      };
      const mockDocFile = {
        originalname: 'invoice.pdf',
        mimetype: 'application/pdf',
      };
  
      const docURL = 'http://example.com/invoice.pdf';
      uploadService.uploadFile.mockResolvedValue(docURL);
      
      const mockBillingInstance = {
        ...mockBillingData,
        userId: 'user123',
        document: {
          link: docURL,
          mimeType: mockDocFile.mimetype,
          name: mockDocFile.originalname,
        },
        save: jest.fn().mockResolvedValue({
          ...mockBillingData,
          userId: 'user123',
          document: {
            link: docURL,
            mimeType: mockDocFile.mimetype,
            name: mockDocFile.originalname,
          },
        }), // Mock l'instance de Billing
      };
      
      Billing.mockImplementation(() => mockBillingInstance); // Mock l'instance Billing
  
      const result = await createBillingForUser('user123', mockBillingData, mockDocFile);
  
    //   expect(Billing).toHaveBeenCalledWith({
    //     userId: 'user123',
    //     amount: mockBillingData.amount,
    //     dueDate: mockBillingData.dueDate,
    //     status: mockBillingData.status,
    //     document: {
    //       link: docURL,
    //       mimeType: mockDocFile.mimetype,
    //       name: mockDocFile.originalname,
    //     },
    //   });
      
      expect(result).toEqual({
        ...mockBillingData,
        userId: 'user123',
        document: {
          link: docURL,
          mimeType: mockDocFile.mimetype,
          name: mockDocFile.originalname,
        },
      });
    });
  
    it('should create a billing for user without document', async () => {
      const mockBillingData = {
        amount: 100,
        dueDate: new Date('2024-10-20T22:03:33.972Z'),
        status: 'Pending',
      };
  
      const mockBillingInstance = {
        ...mockBillingData,
        userId: 'user123',
        save: jest.fn().mockResolvedValue(mockBillingData), // Mock le save
      };
      
      Billing.mockImplementation(() => mockBillingInstance); // Mock l'instance Billing
  
      const result = await createBillingForUser('user123', mockBillingData, null);
  
      expect(Billing).toHaveBeenCalledWith({
        userId: 'user123',
        amount: mockBillingData.amount,
        dueDate: mockBillingData.dueDate,
        status: mockBillingData.status,
      });
      
      expect(result).toEqual(mockBillingData); // Vérifie que le résultat correspond à la facturation
    });
  });
  
  describe('getBillingByUserId', () => {
    it('should retrieve billings for a user', async () => {
      const billings = [{ userId, amount: 100, status: 'Pending' }];
      Billing.find.mockResolvedValue(billings);

      const result = await getBillingByUserId(userId);

      expect(Billing.find).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(billings);
    });
  });

  describe('updateBillingStatus', () => {
    it('should update the status of a billing', async () => {
      const billingId = 'billing123';
      const updatedBilling = { ...mockBillingData, status: 'Paid' };
      Billing.findByIdAndUpdate.mockResolvedValue(updatedBilling);

      const result = await updateBillingStatus(billingId, 'Paid');

      expect(Billing.findByIdAndUpdate).toHaveBeenCalledWith(billingId, { status: 'Paid' }, { new: true });
      expect(result).toEqual(updatedBilling);
    });
  });

  describe('getAllBillingsForUser', () => {
    it('should retrieve all billings for a user', async () => {
      const billings = [{ userId, amount: 100, status: 'Pending' }];
      Billing.find.mockResolvedValue(billings);

      const result = await getAllBillingsForUser(userId);

      expect(Billing.find).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(billings);
    });

    it('should throw an error if unable to retrieve billings', async () => {
      const errorMessage = 'Database error';
      Billing.find.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      await expect(getAllBillingsForUser(userId)).rejects.toThrow(`Error retrieving billings for user: ${errorMessage}`);
    });
  });

  describe('deleteBillingById', () => {
    it('should delete a billing by id', async () => {
      const billingId = 'billing123';
      Billing.findByIdAndDelete.mockResolvedValue(true);

      const result = await deleteBillingById(billingId);

      expect(Billing.findByIdAndDelete).toHaveBeenCalledWith(billingId);
      expect(result).toBe(true);
    });

    it('should throw an error if unable to delete billing', async () => {
      const errorMessage = 'Database error';
      Billing.findByIdAndDelete.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      await expect(deleteBillingById('billing123')).rejects.toThrow(`Error deleting billing: ${errorMessage}`);
    });
  });
});
