const MemberService = require('../services/MemberService');
const InvestorService = require('../services/InvestorService');
const ContactRequest = require('../models/ContactRequest');
const EmailingService = require('../services/EmailingService');
const { DiffDate } = require('../utils/dateUtils');
const InvestorContactService = require('../services/InvestorContactService');

// Mock the required dependencies
jest.mock('../services/MemberService');
jest.mock('../services/InvestorService');
jest.mock('../models/ContactRequest');
jest.mock('../services/EmailingService');
jest.mock('../utils/dateUtils');

describe('CreateInvestorContactReq', () => {
  it('should create a new contact request and return it', async () => {
    // Mock the necessary data and functions
    const memberId = '1';
    const investorId = '2';
    const cost = 3;
    const delay = 180;
    const member = { subStatus: 'active', credits: 5 };
    const investor = { owner: 'investor@example.com' };
    const contactRequest = { member: memberId, investor: investorId, cost };

    MemberService.getMemberById.mockResolvedValue(member);
    InvestorService.getInvestorById.mockResolvedValue(investor);
    ContactRequest.find.mockResolvedValue([]);
    ContactRequest.create.mockResolvedValue(contactRequest);
    Investor.findByIdAndUpdate.mockResolvedValue(investor);
    Member.findByIdAndUpdate.mockResolvedValue(member);
    DiffDate.mockResolvedValue(delay - 1);
    EmailingService.sendNewContactRequestEmail.mockResolvedValue();

    // Call the function being tested
    const result = await InvestorContactService.CreateInvestorContactReq(memberId, investorId);

    // Assert the expected results
    expect(result).toEqual(contactRequest);

    // Assert that the necessary functions were called with the correct arguments
    expect(MemberService.getMemberById).toHaveBeenCalledWith(memberId);
    expect(InvestorService.getInvestorById).toHaveBeenCalledWith(investorId);
    expect(ContactRequest.find).toHaveBeenCalledWith({
      $and: [{ status: { $in: ['pending', 'accepted'] } }, { member: memberId }, { investor: investorId }]
    });
    expect(ContactRequest.create).toHaveBeenCalledWith(contactRequest);
    expect(Investor.findByIdAndUpdate).toHaveBeenCalledWith(investorId, {
      $push: { membersRequestsPending: memberId }
    });
    expect(Member.findByIdAndUpdate).toHaveBeenCalledWith(memberId, {
      $push: { investorsRequestsPending: investorId },
      $inc: { credits: -cost }
    });
    expect(DiffDate).toHaveBeenCalledWith(expect.any(Date));
    expect(EmailingService.sendNewContactRequestEmail).toHaveBeenCalledWith(
      investor.owner,
      member.companyName,
      member.country
    );
  });

  it('should throw an error if member or investor does not exist', async () => {
    // Mock the necessary data and functions
    const memberId = '1';
    const investorId = '2';

    MemberService.getMemberById.mockResolvedValue(null);
    InvestorService.getInvestorById.mockResolvedValue(null);

    // Call the function being tested and expect it to throw an error
    await expect(InvestorContactService.CreateInvestorContactReq(memberId, investorId)).rejects.toThrow(
      "member Or Investor doesn't exist"
    );

    // Assert that the necessary functions were called with the correct arguments
    expect(MemberService.getMemberById).toHaveBeenCalledWith(memberId);
    expect(InvestorService.getInvestorById).toHaveBeenCalledWith(investorId);
  });

  // Add more test cases to cover other scenarios and edge cases
});