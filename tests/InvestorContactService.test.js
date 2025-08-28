const ContactRequestService = require('../services/InvestorContactService');
const ContactRequest = require('../models/ContactRequest');
const Member = require('../models/Member');
const Investor = require('../models/Investor');
const Project = require('../models/Project');
const Subscription = require('../models/Subscription');
const MemberService = require('../services/MemberService');
const InvestorService = require('../services/InvestorService');
const SubscriptionService = require('../services/SubscriptionService');
const ProjectService = require('../services/ProjectService');
const uploadService = require('../services/FileService');
const ActivityHistoryService = require('../services/ActivityHistoryService');
const NotificationService = require('../services/NotificationService');
const { Types } = require('mongoose');

// Mock des dépendances
jest.mock('../models/ContactRequest');
jest.mock('../models/Member');
jest.mock('../models/Investor');
jest.mock('../models/Project');
jest.mock('../models/Subscription');
jest.mock('../services/MemberService');
jest.mock('../services/InvestorService');
jest.mock('../services/SubscriptionService');
jest.mock('../services/ProjectService');
jest.mock('../services/FileService');
jest.mock('../services/ActivityHistoryService');
jest.mock('../services/NotificationService');
jest.mock('../services/InvestorService');

describe('ContactRequestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup common mocks
    ContactRequest.find.mockImplementation(() => ({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([])
    }));
  });

  // Tests pour CreateInvestorContactReq
  describe('CreateInvestorContactReq', () => {
    jest.setTimeout(30000); // Increase timeout for async operations
    beforeEach(() => {
      jest.clearAllMocks();

      // Setup default mock for ContactRequest.find()
      ContactRequest.find.mockImplementation(() => ({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
        exec: jest.fn().mockResolvedValue([])
      }));
    });

    // it('should create a contact request successfully', async () => {
    //   // Setup
    //   const memberId = new Types.ObjectId();
    //   const investorId = new Types.ObjectId();
    //   const userId = new Types.ObjectId();
    //   const investorUserId = new Types.ObjectId();
    //   const subId = new Types.ObjectId(); // 🔹 subscription id cohérent

    //   const mockMember = {
    //     _id: memberId,
    //     owner: userId,
    //     companyName: 'Test Co',
    //     country: 'US'
    //   };
    //   const mockInvestor = {
    //     _id: investorId,
    //     owner: investorUserId,
    //     name: 'Test Investor'
    //   };
    //   const mockSubscription = {
    //     subscriptionStatus: 'active',
    //     totalCredits: 1000,   // 🔹 suffisant pour couvrir cost = 320
    //     _id: subId
    //   };

    //   MemberService.getMemberById.mockResolvedValue(mockMember);
    //   InvestorService.getInvestorById.mockResolvedValue(mockInvestor);
    //   SubscriptionService.getSubscriptionsByUser.mockResolvedValue(mockSubscription);

    //   // Mock for checking existing requests (none exist)
    //   ContactRequest.find.mockImplementation(() => ({
    //     sort: jest.fn().mockReturnThis(),
    //     limit: jest.fn().mockResolvedValue([])
    //   }));

    //   ContactRequest.create.mockResolvedValue({
    //     _id: 'req123',
    //     member: memberId,
    //     investor: investorId
    //   });

    //   // Mock for Investor and Member updates
    //   Investor.findByIdAndUpdate.mockResolvedValue({});
    //   Member.findByIdAndUpdate.mockResolvedValue({});
    //   Subscription.findByIdAndUpdate.mockResolvedValue({});

    //   // Execute
    //   const result = await ContactRequestService.CreateInvestorContactReq(memberId, investorId);

    //   // Verify
    //   expect(result).toBeDefined();
    //   expect(ContactRequest.create).toHaveBeenCalled();
    //   expect(Investor.findByIdAndUpdate).toHaveBeenCalledWith(
    //     investorId,
    //     { $push: { membersRequestsPending: memberId } },
    //     { new: true }
    //   );
    //   expect(Member.findByIdAndUpdate).toHaveBeenCalledWith(
    //     memberId,
    //     { $push: { investorsRequestsPending: investorId } },
    //     { new: true }
    //   );
    //   expect(Subscription.findByIdAndUpdate).toHaveBeenCalledWith(
    //     subId,   // 🔹 cohérent avec mockSubscription
    //     { $inc: { totalCredits: -320 } }, // 🔹 cost réel dans le service
    //     { new: true }
    //   );
    // });


    it('should throw error if member or investor does not exist', async () => {
      MemberService.getMemberById.mockResolvedValue(null);
      InvestorService.getInvestorById.mockResolvedValue(null);

      await expect(ContactRequestService.CreateInvestorContactReq(null, null))
        .rejects.toThrow("member Or Investor doesn't exist");
    });

    // it('should throw error if request already exists', async () => {
    //   // Generate proper ObjectIds
    //   const memberId = new Types.ObjectId();
    //   const investorId = new Types.ObjectId();
    //   const userId = new Types.ObjectId();
    //   const subscriptionId = new Types.ObjectId();

    //   // Setup mocks
    //   const mockMember = {
    //     _id: memberId,
    //     owner: userId
    //   };

    //   const mockInvestor = {
    //     _id: investorId,
    //     owner: new Types.ObjectId()
    //   };

    //   const mockSubscription = {
    //     subscriptionStatus: 'active',
    //     totalCredits: 10
    //   };

    //   // Mock services
    //   MemberService.getMemberById.mockResolvedValue(mockMember);
    //   InvestorService.getInvestorById.mockResolvedValue(mockInvestor);
    //   SubscriptionService.getSubscriptionsByUser.mockResolvedValue(mockSubscription);

    //   // Mock to return existing request
    //   ContactRequest.find.mockImplementation(() => ({
    //     sort: jest.fn().mockReturnThis(),
    //     limit: jest.fn().mockReturnThis(),
    //     exec: jest.fn().mockResolvedValue([{ 
    //       _id: new Types.ObjectId(),
    //       member: memberId,
    //       investor: investorId,
    //       status: 'pending'
    //     }])
    //   }));

    //   // Execute and verify
    //   await expect(
    //     ContactRequestService.CreateInvestorContactReq(memberId, investorId)
    //   ).rejects.toThrow('Request already exists');

    //   // Verify no database operations were attempted
    //   expect(ContactRequest.create).not.toHaveBeenCalled();
    //   expect(Investor.findByIdAndUpdate).not.toHaveBeenCalled();
    //   expect(Member.findByIdAndUpdate).not.toHaveBeenCalled();
    //   expect(Subscription.findByIdAndUpdate).not.toHaveBeenCalled();
    // });

    it('should throw error if not enough credits', async () => {
      const memberId = new Types.ObjectId();
      const investorId = new Types.ObjectId();
      const userId = new Types.ObjectId();
      const investorUserId = new Types.ObjectId();
      const mockMember = { _id: memberId, owner: userId, companyName: 'Test Co', country: 'US' };
      const mockInvestor = { _id: investorId, owner: investorUserId, name: 'Test Investor' };
      const mockSubscription = { subscriptionStatus: 'active', totalCredits: 1 };

      MemberService.getMemberById.mockResolvedValue(mockMember);
      InvestorService.getInvestorById.mockResolvedValue(mockInvestor);
      SubscriptionService.getSubscriptionsByUser.mockResolvedValue(mockSubscription);

      // Mock for checking existing requests (none)
      ContactRequest.find.mockImplementation(() => ({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      }));

      await expect(ContactRequestService.CreateInvestorContactReq(memberId, investorId))
        .rejects.toThrow('Not Enough Credits!');
    });
  });

  // Tests pour getAllContactRequest
  describe('getAllContactRequest', () => {
    it('should return paginated contact requests for member', async () => {
      const args = { page: 1, pageSize: 10 };
      const role = 'member';
      const id = 'member123';

      const mockRequests = [{ _id: 'req1' }, { _id: 'req2' }];

      ContactRequest.countDocuments.mockResolvedValue(2);
      ContactRequest.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue(mockRequests)
              })
            })
          })
        })
      });

      const result = await ContactRequestService.getAllContactRequest(args, role, id);

      expect(result.ContactsHistory.length).toBe(2);
      expect(result.totalPages).toBe(1);
    });
  });

  // Tests pour approveContactRequest
  describe('approveContactRequest', () => {
    it('should approve a contact request successfully', async () => {
      const requestId = 'req123';
      const approvalData = { approvalNotes: 'Approved', typeInvestment: 'Equity' };

      const mockRequest = {
        _id: requestId,
        status: 'Pending',
        member: 'member123',
        investor: 'investor123',
        project: 'project123',
        approval: {}, // Initialize approval object
        save: jest.fn().mockResolvedValue(true)
      };

      ContactRequest.findById.mockResolvedValue(mockRequest);
      MemberService.getMemberById.mockResolvedValue({ owner: 'user123' });
      InvestorService.getInvestorById.mockResolvedValue({
        owner: 'investorUser123',
        name: 'Test Investor',
        companyName: 'Test Investor Co'
      });
      ProjectService.getProjectById.mockResolvedValue({ name: 'Test Project' });

      const result = await ContactRequestService.approveContactRequest(requestId, approvalData);

      expect(result.status).toBe('Approved');
      expect(result.approval.approvalNotes).toBe('Approved');
    });
  });

  // Tests pour rejectContactRequest
  describe('rejectContactRequest', () => {
    it('should reject a contact request successfully', async () => {
      const requestId = 'req123';
      const rejectionData = { reason: 'Not interested', rejectionNotes: 'No capacity' };

      const mockRequest = {
        _id: requestId,
        status: 'Pending',
        member: 'member123',
        investor: 'investor123',
        project: 'project123',
        rejection: {}, // Initialize rejection object
        save: jest.fn().mockResolvedValue(true)
      };

      ContactRequest.findById.mockResolvedValue(mockRequest);
      MemberService.getMemberById.mockResolvedValue({ owner: 'user123' });
      InvestorService.getInvestorById.mockResolvedValue({ owner: 'investorUser123', name: 'Test Investor' });
      ProjectService.getProjectById.mockResolvedValue({ name: 'Test Project' });

      const result = await ContactRequestService.rejectContactRequest(requestId, rejectionData);

      expect(result.status).toBe('Rejected');
      expect(result.rejection.reason).toBe('Not interested');
      expect(NotificationService.createNotification).toHaveBeenCalled();
    });
  });

  // Tests pour countApprovedInvestments
  describe('countApprovedInvestments', () => {
    it('should count distinct investors for member', async () => {
      const role = 'member';
      const id = 'member123';

      ContactRequest.distinct.mockResolvedValue(['inv1', 'inv2']);

      const result = await ContactRequestService.countApprovedInvestments(role, id);

      expect(result.count).toBe(2);
    });

    it('should count total approved requests for investor', async () => {
      const role = 'investor';
      const id = 'investor123';

      ContactRequest.countDocuments.mockResolvedValue(5);

      const result = await ContactRequestService.countApprovedInvestments(role, id);

      expect(result.count).toBe(5);
    });
  });

  // Tests pour CreateDraftContactRequest et FinalizeContactRequest
  // describe('Draft Contact Request Flow', () => {
  //   let mockDraft;
  //   let mockSubscription;

  //   beforeEach(() => {
  //     jest.clearAllMocks();

  //     // Setup mock draft
  //     mockDraft = {
  //       _id: 'draft123',
  //       member: 'member123',
  //       investor: 'investor123',
  //       status: 'Draft',
  //       save: jest.fn().mockImplementation(function() {
  //         return Promise.resolve(this);
  //       })
  //     };

  //     // Setup mock subscription
  //     mockSubscription = {
  //       _id: 'sub123',
  //       subscriptionStatus: 'active',
  //       totalCredits: 1000,
  //       save: jest.fn()
  //     };

  //     // Mock ContactRequest constructor
  //     ContactRequest.mockImplementation(() => mockDraft);

  //     // Mock Subscription.findByIdAndUpdate to return the updated subscription
  //     Subscription.findByIdAndUpdate.mockImplementation((id, update, options) => {
  //       if (options?.new) {
  //         return Promise.resolve({
  //           ...mockSubscription,
  //           ...update.$inc,
  //           totalCredits: mockSubscription.totalCredits + (update.$inc?.totalCredits || 0)
  //         });
  //       }
  //       return Promise.resolve(mockSubscription);
  //     });
  //   });

  //   it('should create draft and finalize successfully', async () => {
  //     const memberId = 'member123';
  //     const investorId = 'investor123';
  //     const projectId = 'project123';
  //     const document = { 
  //       originalname: 'plan.pdf', 
  //       mimetype: 'application/pdf',
  //       buffer: Buffer.from('test content')
  //     };
  //     const data = 'Project details';

  //     // Mock dependencies
  //     MemberService.getMemberById.mockResolvedValue({ 
  //       _id: memberId, 
  //       owner: 'user123' 
  //     });
  //     InvestorService.getInvestorById.mockResolvedValue({ 
  //       _id: investorId, 
  //       owner: 'investorUser123' 
  //     });
  //     SubscriptionService.getSubscriptionsByUser.mockResolvedValue(mockSubscription);
  //     ProjectService.getProjectById.mockResolvedValue({ 
  //       _id: projectId, 
  //       name: 'Final Project' 
  //     });
  //     uploadService.uploadFile.mockResolvedValue('http://example.com/plan.pdf');

  //     // 1. Test draft creation
  //     const draft = await ContactRequestService.CreateDraftContactRequest(memberId, investorId);

  //     expect(draft.status).toBe('Draft');
  //     expect(Subscription.findByIdAndUpdate).toHaveBeenCalledWith(
  //       'sub123',
  //       { $inc: { totalCredits: -320 } },
  //       // { new: true } // This is now properly expected
  //     );

  //     // 2. Test finalization
  //     ContactRequest.findById.mockResolvedValue(mockDraft);

  //     const finalizedRequest = {
  //       ...mockDraft,
  //       _id: 'finalized123',
  //       status: 'In Progress',
  //       project: projectId,
  //       document: {
  //         name: 'plan.pdf',
  //         link: 'http://example.com/plan.pdf',
  //         mimeType: 'application/pdf'
  //       },
  //       requestLetter: data,
  //       dateCreated: new Date()
  //     };

  //     ContactRequest.findByIdAndUpdate.mockResolvedValue(finalizedRequest);

  //     const finalized = await ContactRequestService.FinalizeContactRequest(
  //       draft._id, projectId, document, data
  //     );

  //     expect(finalized.status).toBe('In Progress');
  //     expect(finalized.project).toBe(projectId);
  //     expect(finalized.document.link).toBe('http://example.com/plan.pdf');
  //   });
  // });
});
