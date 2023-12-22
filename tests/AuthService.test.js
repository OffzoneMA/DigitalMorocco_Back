const MemberService = require('../services/MemberService');
const ProjectService = require('../services/ProjectService');
const PartnerService = require('../services/PartnerService');

// Mock the required dependencies
jest.mock('../services/MemberService');
jest.mock('../services/ProjectService');
jest.mock('../services/PartnerService');

describe('generateUserInfos', () => {
  it('should generate user info for a member with a project', async () => {
    // Mock the necessary data and functions
    const user = {
      role: 'member',
      _id: '1',
    };
    const member = {
      _id: '2',
      companyName: 'Company A',
    };
    const project = {
      _id: '3',
      name: 'Project X',
    };

    MemberService.getMemberByUserId.mockResolvedValue(member);
    ProjectService.getProjectByMemberId.mockResolvedValue(project);

    // Call the function being tested
    const result = await generateUserInfos(user);

    // Assert the expected results
    expect(result).toEqual({
      accessToken: expect.anything(),
      user: {
        ...user,
        member: {
          ...member,
          project: project,
        },
      },
    });

    // Assert that the necessary functions were called with the correct arguments
    expect(MemberService.getMemberByUserId).toHaveBeenCalledWith(user._id);
    expect(ProjectService.getProjectByMemberId).toHaveBeenCalledWith(member._id);
  });

  it('should generate user info for a member without a project', async () => {
    // Mock the necessary data and functions
    const user = {
      role: 'member',
      _id: '1',
    };
    const member = {
      _id: '2',
      companyName: 'Company A',
    };

    MemberService.getMemberByUserId.mockResolvedValue(member);
    ProjectService.getProjectByMemberId.mockResolvedValue(null);

    // Call the function being tested
    const result = await generateUserInfos(user);

    // Assert the expected results
    expect(result).toEqual({
      accessToken: expect.anything(),
      user: {
        ...user,
        member: member,
      },
    });

    // Assert that the necessary functions were called with the correct arguments
    expect(MemberService.getMemberByUserId).toHaveBeenCalledWith(user._id);
    expect(ProjectService.getProjectByMemberId).toHaveBeenCalledWith(member._id);
  });

  it('should generate user info for a partner', async () => {
    // Mock the necessary data and functions
    const user = {
      role: 'partner',
      _id: '1',
    };
    const partner = {
      _id: '2',
      companyName: 'Company B',
    };

    PartnerService.getPartnerByUserId.mockResolvedValue(partner);

    // Call the function being tested
    const result = await generateUserInfos(user);

    // Assert the expected results
    expect(result).toEqual({
      accessToken: expect.anything(),
      user: {
        ...user,
        partner: partner,
      },
    });

    // Assert that the necessary functions were called with the correct arguments
    expect(PartnerService.getPartnerByUserId).toHaveBeenCalledWith(user._id);
  });
});