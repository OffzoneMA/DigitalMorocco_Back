const EmployeeService = require('../services/EmployeeService');
const Employee = require('../models/Employees');
const ActivityHistoryService = require('../services/ActivityHistoryService');
const uploadService = require('../services/FileService');
const UserService = require('../services/UserService');

jest.mock('../models/Employees');
jest.mock('../services/ActivityHistoryService');
jest.mock('../services/FileService');
jest.mock('../services/UserService');

describe('EmployeeService', () => {
    const mockUserId = 'user123';
    const mockEmployeeData = {
        fullName: 'John Doe',
        jobTitle: 'Developer',
        workEmail: 'john@example.com',
    };
    const mockImage = {
        originalname: 'logo.png',
        mimetype: 'image/png',
    };

    // describe('createEmployee', () => {
    //     it('should create an employee with image', async () => {
    //         UserService.getUserByID.mockResolvedValue({ _id: mockUserId });
            
    //         const mockEmployeeInstance = {
    //             ...mockEmployeeData,
    //             _id: 'employee123',
    //             save: jest.fn().mockResolvedValue(true), // On moque save pour qu'il fonctionne
    //         };

    //         Employee.mockImplementation(() => mockEmployeeInstance); // On moque le constructeur de Employee
    //         uploadService.uploadFile.mockResolvedValue('http://example.com/logo.png');

    //         const result = await EmployeeService.createEmployee(mockUserId, mockEmployeeData, mockImage);

    //         expect(Employee).toHaveBeenCalledWith({
    //             ...mockEmployeeData,
    //             createdBy: mockUserId,
    //             updatedBy: mockUserId,
    //         });
    //         expect(mockEmployeeInstance.save).toHaveBeenCalledTimes(2); // On l'appelle deux fois
    //         expect(uploadService.uploadFile).toHaveBeenCalledWith(
    //             mockImage,
    //             `Users/${mockUserId}/employees/${mockEmployeeInstance._id}`,
    //             mockImage.originalname
    //         );
    //         expect(result).toEqual(mockEmployeeInstance);
    //         expect(ActivityHistoryService.createActivityHistory).toHaveBeenCalledWith(
    //             mockUserId,
    //             'employee_added',
    //             { targetName: mockEmployeeData.fullName, targetDesc: '' }
    //         );
    //     });

    //     it('should throw an error if user not found', async () => {
    //         UserService.getUserByID.mockResolvedValue(null);

    //         await expect(EmployeeService.createEmployee(mockUserId, mockEmployeeData, mockImage)).rejects.toThrow('User not found');
    //     });
    // });

    describe('updateEmployee', () => {
        it('should update an employee with image', async () => {
            const mockEmployee = {
                _id: 'employee123',
                fullName: 'John Doe',
                createdBy: mockUserId,
                set: jest.fn(),
                save: jest.fn().mockResolvedValue(true), // On moque save pour qu'il fonctionne
            };
            Employee.findById.mockResolvedValue(mockEmployee);
            uploadService.uploadFile.mockResolvedValue('http://example.com/new-logo.png');

            const updateData = { jobTitle: 'Senior Developer' };
            const result = await EmployeeService.updateEmployee(mockEmployee._id, updateData, mockImage);

            expect(mockEmployee.set).toHaveBeenCalledWith(updateData);
            expect(uploadService.uploadFile).toHaveBeenCalledWith(
                mockImage,
                `Users/${mockUserId}/employees/${mockEmployee._id}`,
                mockImage.originalname
            );
            expect(result).toEqual(mockEmployee);
            expect(ActivityHistoryService.createActivityHistory).toHaveBeenCalledWith(
                mockUserId,
                'employee_updated',
                { targetName: mockEmployee.fullName, targetDesc: '' }
            );
        });

        it('should throw an error if employee not found', async () => {
            Employee.findById.mockResolvedValue(null);

            await expect(EmployeeService.updateEmployee('invalidId', {}, mockImage)).rejects.toThrow('Employee not found');
        });
    });

    describe('getAllEmployees', () => {
      it('should return all employees', async () => {
          const mockEmployees = [{ _id: 'employee123', fullName: 'John Doe' }];
  
          // Création d'un mock de la méthode find
          Employee.find.mockReturnValue({
              sort: jest.fn().mockReturnThis(), // Permet le chaînage
              exec: jest.fn().mockResolvedValue(mockEmployees), // Renvoie les employés mockés
          });
  
          const result = await EmployeeService.getAllEmployees();
  
          expect(result).toEqual(mockEmployees); // Vérifie que le résultat est celui attendu
      });
  
      it('should throw an error if getting employees fails', async () => {
          Employee.find.mockImplementation(() => {
              throw new Error('Some error');
          });
  
          await expect(EmployeeService.getAllEmployees()).rejects.toThrow('Error getting all employees: Some error');
      });
  });
   

    describe('getAllEmployeesByUser', () => {
        it('should return all employees created by a user', async () => {
            const mockEmployees = [{ _id: 'employee123', fullName: 'John Doe' }];
            const mockQuery = {
                skip: jest.fn().mockReturnThis(), // Permettre le chaînage
                sort: jest.fn().mockReturnThis(), // Permettre le chaînage
                limit: jest.fn().mockResolvedValue(mockEmployees), // Moquer la méthode limit
            };

            Employee.find.mockReturnValue(mockQuery); // Moquer Employee.find()

            const args = { page: 1, pageSize: 8 };
            const result = await EmployeeService.getAllEmployeesByUser(mockUserId, args);

            expect(result.employees).toEqual(mockEmployees);
        });

        it('should throw an error if getting employees fails', async () => {
            Employee.find.mockImplementation(() => { throw new Error('Some error'); });

            await expect(EmployeeService.getAllEmployeesByUser(mockUserId, {})).rejects.toThrow('Error getting all employees by user: Some error');
        });
    });

    // Ajoute les autres tests pour les fonctions restantes
});
