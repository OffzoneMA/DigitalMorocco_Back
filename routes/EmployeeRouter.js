const express = require("express")
const router = express.Router()
const EmployeeController = require('../controllers/EmployeeController');
const AuthController = require('../controllers/AuthController');
const upload = require("../middelware/multer")

/**
 * @swagger
 *  components:
 *    schemas:
 *      Employee:
 *        type: object
 *        properties:
 *          id:
 *            type: string
 *            description: The auto-generated id of the employee
 *          fullName:
 *            type: string
 *            description: The full name of the employee
 *          workEmail:
 *            type: string
 *            format: email
 *            description: The work email of the employee
 *          address:
 *            type: string
 *            description: The address of the employee
 *          country:
 *            type: string
 *            description: The country of the employee
 *          department:
 *            type: string
 *            description: The department of the employee
 *          cityState:
 *            type: string
 *            description: The city and state of the employee
 *          startDate:
 *            type: string
 *            format: date
 *            description: The start date of the employee
 *          jobTitle:
 *            type: string
 *            description: The job title of the employee
 *          typeEmp:
 *            type: string
 *            description: The type of the employee
 *          personalTaxIdentifierNumber:
 *            type: string
 *            description: The personal tax identifier number of the employee
 *          level:
 *            type: string
 *            description: The level of the employee
 *          status:
 *            type: string
 *            default: active
 *          image:
 *            type: string
 *            default: active
 *        example:
 *           fullName: John Doe
 *           workEmail: johndoe@example.com
 *           address: 123 Main St
 *           country: USA
 *           department: Sales
 *           cityState: New York, NY
 *           startDate: 2021-01-01
 *           jobTitle: Sales Representative
 *           typeEmp: Full-time
 *           personalTaxIdentifierNumber: 123456789
 *           level: Junior
 *           status: active
 *           image: https://example.com/photo.jpg
 */

/**
 * @swagger
 * /employee/add:
 *   post:
 *     summary: Create an employee
 *     tags: [Employees]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: The full name of the employee
 *               workEmail:
 *                 type: string
 *                 format: email
 *                 description: The work email of the employee
 *               address:
 *                 type: string
 *                 description: The address of the employee
 *               country:
 *                 type: string
 *                 description: The country of the employee
 *               department:
 *                 type: string
 *                 description: The department of the employee
 *               cityState:
 *                 type: string
 *                 description: The city and state of the employee
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the employee
 *               jobTitle:
 *                 type: string
 *                 description: The job title of the employee
 *               typeEmp:
 *                 type: string
 *                 description: The type of the employee
 *               personalTaxIdentifierNumber:
 *                 type: string
 *                 description: The personal tax identifier number of the employee
 *               level:
 *                 type: string
 *                 description: The level of the employee
 *               status:
 *                 type: string
 *                 default: active
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The photo of the employee
 *     responses:
 *       200:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Bad request, check the request body
 */
router.post("/add",AuthController.AuthenticateUser, upload.single("image"), EmployeeController.createEmployee);

/**
 * @swagger
 * /employee/{employeeId}:
 *   put:
 *     summary: Update an employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         schema:
 *           type: string
 *         required: true
 *         description: The employee id
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: The full name of the employee
 *               workEmail:
 *                 type: string
 *                 format: email
 *                 description: The work email of the employee
 *               address:
 *                 type: string
 *                 description: The address of the employee
 *               country:
 *                 type: string
 *                 description: The country of the employee
 *               department:
 *                 type: string
 *                 description: The department of the employee
 *               cityState:
 *                 type: string
 *                 description: The city and state of the employee
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the employee
 *               jobTitle:
 *                 type: string
 *                 description: The job title of the employee
 *               typeEmp:
 *                 type: string
 *                 description: The type of the employee
 *               personalTaxIdentifierNumber:
 *                 type: string
 *                 description: The personal tax identifier number of the employee
 *               level:
 *                 type: string
 *                 description: The level of the employee
 *               status:
 *                 type: string
 *                 default: active
 *               image: 
 *                 type: string
 *                 format: binary
 *                 description: The photo of the employee
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Bad request, check the request body
 *       404:
 *         description: Employee not found
 */
router.put("/:employeeId", upload.single("image"), EmployeeController.updateEmployee);

/**
 * @swagger
 *  /employee/byuser:
 *    get:
 *      summary: Get all employees
 *      description: Get all employees by user
 *      tags: [Employees]
 *      parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: page
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: string
 *         description: pageSize
 *      responses:
 *        200:
 *          description: Successful response
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Employee'
 */
router.get("/byuser", AuthController.AuthenticateUser , EmployeeController.getAllEmployeesByUser);

/**
 * @swagger
 *  /employee/byuser:
 *    get:
 *      summary: Get all employees
 *      description: Get all employees by user
 *      tags: [Employees]
 *      responses:
 *        200:
 *          description: Successful response
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Employee'
 */
router.get("/byuserWithoutPage", AuthController.AuthenticateUser , EmployeeController.getAllEmployeesByUserWithoutPagination);


/**
 * @swagger
 * /employee/{employeeId}:
 *   delete:
 *     summary: Delete an employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         schema:
 *           type: string
 *         required: true
 *         description: The employee id
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       404:
 *         description: Employee not found
 */
router.delete("/:employeeId", EmployeeController.deleteEmployee);

/**
 * @swagger
 * /employee/{employeeId}:
 *   get:
 *     summary: Get an employee by ID
 *     description: Get an employee from the database by their ID.
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the employee to get
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
 */
router.get("/:employeeId", EmployeeController.getEmployeeById);

/**
 * @swagger
 *  /employee:
 *    get:
 *      summary: Get all employees
 *      description: Get all employees from the database.
 *      tags: [Employees]
 *      responses:
 *        200:
 *          description: Successful response
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Employee'
 */
router.get("/", EmployeeController.getAllEmployees);


/**
 * @swagger
 * /employee/{employeeId}/deleteImage:
 *   delete:
 *     summary: Delete an employee image
 *     description: Delete an employee image from the database by their ID.
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         schema:
 *           type: string
 *         required: true
 *         description: The employee id
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       404:
 *         description: Employee not found
 */
router.delete("/:employeeId/deleteImage", EmployeeController.deleteEmployeeImage);


module.exports = router;