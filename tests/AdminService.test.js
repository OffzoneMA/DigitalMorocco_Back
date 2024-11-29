const bcrypt = require('bcrypt');
const User = require('../models/User');
const { createAdmin } = require('../services/AdminService');

// Mocking dependencies
jest.mock('bcrypt');
jest.mock('../models/User');

describe('createAdmin', () => {
  const mockUser = {
    email: 'test@test.com',
    password: 'password123',
    role: '',
    status: '',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should hash the password and create a new admin user', async () => {
    const plainPassword = mockUser.password;  // Store the plain password
    const hashedPassword = 'hashedPassword123';
    
    // Mock bcrypt and User methods
    bcrypt.hash.mockResolvedValue(hashedPassword);
    User.create.mockResolvedValue({ ...mockUser, password: hashedPassword, role: 'Admin', status: 'accepted' });
  
    const result = await createAdmin(mockUser);
  
    // Check that bcrypt.hash was called with the plain password and salt
    expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);  // Use the plain password here
  
    // Check that User.create was called with the expected user object
    expect(User.create).toHaveBeenCalledWith({
      ...mockUser,
      password: hashedPassword,
      role: 'Admin',
      status: 'accepted',
    });
  
    // Validate the returned result
    expect(result).toEqual({
      ...mockUser,
      password: hashedPassword,
      role: 'Admin',
      status: 'accepted',
    });
  });  

  it('should throw an error when email is already in use', async () => {
    const errorMessage = 'Email Already in Use';
    bcrypt.hash.mockResolvedValue('hashedPassword123');
    User.create.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    await expect(createAdmin(mockUser)).rejects.toThrow(errorMessage);

    // Check that bcrypt.hash was called
    expect(bcrypt.hash).toHaveBeenCalledWith(mockUser.password, 10);

    // Check that User.create was called
    expect(User.create).toHaveBeenCalled();
  });
});
