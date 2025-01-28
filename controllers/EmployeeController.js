const EmployeeService = require('../services/EmployeeService');

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


const createEmployee = async (req, res) => {
    try {
        const userId = req.userId;
        const employeeData = isJsonString(req?.body.data) ? JSON.parse(req?.body.data) : req?.body.data; 
        const image = req.file;
        const employee = await EmployeeService.createEmployee(userId, employeeData, image);
        res.status(201).json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateEmployee = async (req, res) => {
    try {
        const employeeId = req.params.employeeId;
        const updateData = isJsonString(req?.body.data) ? JSON.parse(req?.body.data) : req?.body.data;
        const image = req.file;
        const updatedEmployee = await EmployeeService.updateEmployee(employeeId, updateData, image);
        res.status(200).json(updatedEmployee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    } 
};

const getEmployeeById = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const employee = await EmployeeService.getEmployeeById(employeeId);
        res.status(200).json(employee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        await EmployeeService.deleteEmployee(employeeId);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllEmployees = async (req, res) => {
    try {
        const employees = await EmployeeService.getAllEmployees();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllEmployeesByUser = async (req, res) => {
    try {
        const userId = req.userId;
        const employees = await EmployeeService.getAllEmployeesByUser(userId , req.query);
        res.status(200).json(employees);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
};

const getAllEmployeesByUserWithoutPagination = async (req, res) => {
    try {
        const userId = req.userId;
        const employees = await EmployeeService.getAllEmployeesByUserWithoutPagination(userId );
        res.status(200).json(employees);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
};

const deleteEmployeeImage = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const result = await EmployeeService.deleteEmployeeImage(employeeId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createEmployee,
    updateEmployee,
    getEmployeeById,
    deleteEmployee,
    getAllEmployees, deleteEmployeeImage ,
    getAllEmployeesByUser, getAllEmployeesByUserWithoutPagination
};