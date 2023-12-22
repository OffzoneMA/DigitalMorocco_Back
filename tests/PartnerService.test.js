const Partner = require('../models/Partner');
const uploadService = require('../services/uploadService');
const { createEnterprise } = require('../services/PartnerService');

// Mock the Partner model and uploadService
jest.mock('../models/Partner');
jest.mock('../services/uploadService');

describe('createEnterprise', () => {
  it('should create an enterprise with the given partnerId, infos, documents, and logo', async () => {
    // Arrange
    const partnerId = 'partner123';
    const infos = {
      companyName: 'My Company',
      legalName: 'Legal Company',
      website: 'www.example.com',
      contactEmail: 'info@example.com',
      address: '123 Main St',
      desc: 'Description',
      country: 'USA',
      city: 'New York',
      state: 'NY',
      companyType: 'Type',
      taxNbr: '123456789',
      corporateNbr: '987654321',
      listEmployee: ['John Doe', 'Jane Smith'],
      visbility: true,
    };
    const documents = [
      { originalname: 'doc1.pdf', mimetype: 'application/pdf' },
      { originalname: 'doc2.pdf', mimetype: 'application/pdf' },
    ];
    const logo = [{ originalname: 'logo.png', mimetype: 'image/png' }];
    const partner = { owner: 'partnerOwner' };
    const expectedEnterprise = { id: 'enterprise123', ...infos };

    Partner.findByIdAndUpdate.mockResolvedValue(expectedEnterprise);
    uploadService.uploadFile.mockImplementation((file, path, filename) => {
      return Promise.resolve(`https://example.com/${path}/${filename}`);
    });

    // Act
    const result = await createEnterprise(partnerId, infos, documents, logo);

    // Assert
    expect(result).toEqual(expectedEnterprise);
    expect(Partner.findByIdAndUpdate).toHaveBeenCalledWith(partnerId, expectedEnterprise);
    expect(uploadService.uploadFile).toHaveBeenCalledTimes(3);
    expect(uploadService.uploadFile).toHaveBeenCalledWith(
      documents[0],
      `Partners/${partner.owner}/documents`,
      documents[0].originalname
    );
    expect(uploadService.uploadFile).toHaveBeenCalledWith(
      documents[1],
      `Partners/${partner.owner}/documents`,
      documents[1].originalname
    );
    expect(uploadService.uploadFile).toHaveBeenCalledWith(
      logo[0],
      `Partners/${partner.owner}`,
      'logo'
    );
  });

  it('should throw an error if something goes wrong', async () => {
    // Arrange
    const partnerId = 'partner123';
    const infos = {
      companyName: 'My Company',
      legalName: 'Legal Company',
      website: 'www.example.com',
      contactEmail: 'info@example.com',
      address: '123 Main St',
      desc: 'Description',
      country: 'USA',
      city: 'New York',
      state: 'NY',
      companyType: 'Type',
      taxNbr: '123456789',
      corporateNbr: '987654321',
      listEmployee: ['John Doe', 'Jane Smith'],
      visbility: true,
    };
    const documents = [
      { originalname: 'doc1.pdf', mimetype: 'application/pdf' },
      { originalname: 'doc2.pdf', mimetype: 'application/pdf' },
    ];
    const logo = [{ originalname: 'logo.png', mimetype: 'image/png' }];

    Partner.findByIdAndUpdate.mockRejectedValue(new Error('Something went wrong'));

    // Act & Assert
    await expect(createEnterprise(partnerId, infos, documents, logo)).rejects.toThrow(
      'Something went wrong'
    );
    expect(Partner.findByIdAndUpdate).toHaveBeenCalledWith(partnerId, expect.any(Object));
    expect(uploadService.uploadFile).not.toHaveBeenCalled();
  });
});