const EmployeeService = require('../services/EmployeeService');

jest.mock('../services/EmployeeService');


describe('EmployeeService', () => {
  describe('createEmployee', () => {
    it('should create a new employee', async () => {
      const userId = '123456789';
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        position: 'Software Engineer',
        department: 'Engineering',
        startDate: '2021-01-01',
        status: 'active',
      };
      const image = {
        originalname: 'profile.jpg',
      }; 
      const employee = await EmployeeService.createEmployee(userId, employeeData, image);
      expect(employee).toBeDefined();
      expect(employee.firstName).toEqual(employeeData.firstName);
      expect(employee.lastName).toEqual(employeeData.lastName);
      expect(employee.position).toEqual(employeeData.position);
      expect(employee.department).toEqual(employeeData.department);
      expect(employee.startDate).toEqual(employeeData.startDate);
      expect(employee.status).toEqual(employeeData.status);
      expect(employee.image).toBeDefined();
    });
  });
});

describe('EmployeeService', () => {
  describe('updateEmployee', () => {
    it('should update an existing employee', async () => {
      const employeeId = '123456789';
      const updateData = {
        firstName: 'Jane',
        lastName: 'Doe',
        position: 'Software Engineer',
        department: 'Engineering',
        startDate: '2021-01-01',
        status: 'active',
      };
      const image = {
        originalname: 'profile.jpg',
      }; 
      const updatedEmployee = await EmployeeService.updateEmployee(employeeId, updateData, image);
      expect(updatedEmployee).toBeDefined();
      expect(updatedEmployee.firstName).toEqual(updateData.firstName);
      expect(updatedEmployee.lastName).toEqual(updateData.lastName);
      expect(updatedEmployee.position).toEqual(updateData.position);
      expect(updatedEmployee.department).toEqual(updateData.department);
      expect(updatedEmployee.startDate).toEqual(updateData.startDate);
      expect(updatedEmployee.status).toEqual(updateData.status);
      expect(updatedEmployee.image).toBeDefined();
    });
  });
});

describe('EmployeeService', () => {
  describe('getEmployeeById', () => {
    it('should get an employee by their id', async () => {
      const employeeId = '123456789';
      const employee = await EmployeeService.getEmployeeById(employeeId);
      expect(employee).toBeDefined();
      expect(employee._id).toEqual(employeeId);
    }); 
  })
});

describe('EmployeeService', () => {
  describe('deleteEmployee', () => {
    it('should delete an employee', async () => {
      const employeeId = '123456789';
      await EmployeeService.deleteEmployee(employeeId);
      const employee = await EmployeeService.getEmployeeById(employeeId);
      expect(employee).toBeNull();
    });
  });
});

describe('EmployeeService', () => {
  describe('getEmployees', () => {
    it('should get all employees', async () => {
      const employees = await EmployeeService.getEmployees();
      expect(employees).toBeDefined();
      expect(employees.length).toBeGreaterThan(0);
    });
  });
});

describe('EmployeeService', () => {
  describe('getEmployeesByUser', () => {
    it('should get all employees by user', async () => {
      const userId = '123456789';
      const employees = await EmployeeService.getEmployeesByUser(userId);
      expect(employees).toBeDefined();
      expect(employees.length).toBeGreaterThan(0);
    }); 
  })
});
