const Employee = require('../models/Employees');
const ActivityHistoryService = require('./ActivityHistoryService');
const uploadService = require('../services/FileService');
const UserService = require('../services/UserService');

async function createEmployee(userId, employeeData, image) {
    try {
        const user = await UserService.getUserByID(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const employee = new Employee({
            ...employeeData,
            createdBy: userId,
            updatedBy: userId
        });

        if (image) {
            const savedEmployee = await employee.save();

            const logoURL = await uploadService.uploadFile(
                image,
                `Users/${userId}/employees/${savedEmployee._id}`, 
                image.originalname
            );

            savedEmployee.image = logoURL;
            await savedEmployee.save(); 
        } else {
            await employee.save();
        }
        await ActivityHistoryService.createActivityHistory(
            userId,
            'employee_added',
            { targetName: employeeData?.fullName, targetDesc: '' }
        );
        return employee;
    } catch (error) {
        throw new Error('Error creating employee: ' + error.message);
    }
}

async function updateEmployee(employeeId ,updateData , image) {
    try {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }
        if (image) {
            const logoURL = await uploadService.uploadFile(
                image,
                `Users/${employee?.createdBy}/employees/${employee?._id}`,
                image.originalname
            );
            updateData.image = logoURL;
        }
        employee.set(updateData);
        await employee.save();
        await ActivityHistoryService.createActivityHistory(
            employee.createdBy,
            'employee_updated',
            { targetName: employee.fullName, targetDesc: '' }
        );
        return employee;
    } catch (error) {
        throw new Error('Error updating employee: ' + error.message);
    }
}

async function getEmployeeById(employeeId) {
    try {
        return await Employee.findById(employeeId);
    } catch (error) {
        throw new Error('Error getting employee: ' + error.message);
    }
}

async function deleteEmployee(employeeId) {
    try {
        const employee = await Employee.findByIdAndDelete(employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }

        await ActivityHistoryService.createActivityHistory(
            employee.createdBy,
            'employee_deleted',
            { targetName: employee.fullName, targetDesc: `Employee ${employee.fullName} was deleted.` }
        );

        return employee;
    } catch (error) {
        throw new Error('Error deleting employee: ' + error.message);
    }
}

const deleteEmployeeImage = async (employeeId) => {
    try {
      // Récupérer les détails de l'employé depuis la base de données
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error("Employee not found");
      }
  
      // Vérifier si l'employé a une image associée
      if (!employee.image) {
        throw new Error("No image associated with this employee");
      }
  
      // Extraire le chemin et le nom de fichier à partir de `imagePath`
      const [path, filename] = uploadService.extractPathAndFilename(employee.image);
  
      // Supprimer l'image depuis le stockage
      const isDeleted = await uploadService.deleteFile(filename, path);
  
      if (!isDeleted) {
        throw new Error("Failed to delete the image");
      }
  
      // Optionnel : Mettre à jour l'employé pour supprimer la référence à l'image
      const updatedEmployee = await Employee.findByIdAndUpdate(employeeId, { image: null }, { new: true });
      await ActivityHistoryService.createActivityHistory(
            employee.createdBy,
            'employee_image_deleted',
            { targetName: employee.fullName, targetDesc: `Image of employee ${employee.fullName} was deleted.` }
        );
      return updatedEmployee;
    } catch (error) {
      console.error("Error deleting employee image:", error.message);
      return { success: false, message: error.message };
    }
  };
  


// async function getAllEmployees() {
//     try {
//         return await Employee.find().sort({ dateCreated: 'desc' });
//     } catch (error) {
//         throw new Error('Error getting all employees: ' + error.message);
//     }
// }

async function getAllEmployees() {
    try {
        return await Employee.find().sort({ dateCreated: 'desc' }).exec();
    } catch (error) {
        throw new Error('Error getting all employees: ' + error.message);
    }
}


async function getAllEmployeesByUserWithoutPagination(userId) {
    try {
        return await Employee.find({ createdBy: userId }).sort({ dateCreated: 'desc' });
    } catch (error) {
        throw new Error('Error getting all employees by user: ' + error.message);
    }
}

async function getAllEmployeesByUser(userId, args) {
    try {
        const page = args.page || 1;
        const pageSize = args.pageSize || 8;
        const skip = (page - 1) * pageSize;
        const totalCount = await Employee.countDocuments({ createdBy: userId });
        const totalPages = Math.ceil(totalCount / pageSize);
        const employees = await Employee.find({ createdBy: userId })
            .skip(skip)
            .sort({ dateCreated: 'desc' })
            .limit(pageSize);
        
        return { employees, totalPages };
    } catch (error) {
        throw new Error('Error getting all employees by user: ' + error.message);
    }
}


async function searchEmployees(user, searchTerm) {
    try {
        const regex = new RegExp(searchTerm, 'i'); 
        const userRole = user?.role?.toLowerCase();
        
        let employees;

        if (userRole === 'admin') {
            employees = await Employee.find({
                $or: [
                    { fullName: regex },
                    // { workEmail: regex },
                    // { jobTitle: regex },
                    // { personalEmail: regex } 
                ]
            });
        } else {
            employees = await Employee.find({
                createdBy: user?._id,
                $or: [
                    { fullName: regex },
                    // { workEmail: regex },
                    // { jobTitle: regex },
                    // { personalEmail: regex } 
                ]
            });
        }

        return employees;
    } catch (error) {
        throw new Error('Error searching employees by user: ' + error.message);
    }
}


async function getEmployeeByUser(userId) {
    try {
        return await Employee.findOne({ createdBy: userId });
    } catch (error) {
        throw new Error('Error getting employee by user: ' + error.message);
    }
}

module.exports = {
    createEmployee,
    updateEmployee,
    getEmployeeById,
    deleteEmployee,
    getAllEmployees,
    getAllEmployeesByUser,
    getEmployeeByUser , searchEmployees , 
    getAllEmployeesByUserWithoutPagination , deleteEmployeeImage
};