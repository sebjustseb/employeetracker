const inquirer = require('inquirer');
const mysql = require('mysql2');
const util = require('util');

// create connection to the database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'PSWD',
    database: 'employee_db'
});

// promisify connection query
const query = util.promisify(connection.query).bind(connection);

// function to view all departments
const viewDepartments = async () => {
    try {
        const departments = await query('SELECT * FROM department');
        console.table(departments);
        startApp();
    } catch (error) {
        console.error('Error viewing departments: ', error);
    }
};

// function to view all roles
const viewRoles = async () => {
    try {
        const roles = await query('SELECT role.id, role.title, role.salary, department.name AS department FROM role LEFT JOIN department ON role.department_id = department.id');
        console.table(roles);
        startApp();
    } catch (error) {
        console.error('Error viewing roles: ', error);
    }
};

// function to view all employees
const viewEmployees = async () => {
    try {
        const employees = await query('SELECT employee.id, employee.first_name, employee.last_name, role.title AS job_title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id');
        console.table(employees);
        startApp();
    } catch (error) {
        console.error('Error viewing employees: ', error);
    }
};

// function to add a department
const addDepartment = async () => {
    try {
        const department = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter the name of the department:'
            }
        ]);
        await query('INSERT INTO department SET ?', department);
        console.log('Department added successfully!');
        startApp();
    } catch (error) {
        console.error('Error adding department: ', error);
    }
};

// function to add a role
const addRole = async () => {
    try {
        const departments = await query('SELECT * FROM department');
        const role = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the title of the role:'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the salary for this role:'
            },
            {
                type: 'list',
                name: 'department_id',
                message: 'Select the department for this role:',
                choices: departments.map(department => ({ name: department.name, value: department.id }))
            }
        ]);
        await query('INSERT INTO role SET ?', role);
        console.log('Role added successfully!');
        startApp();
    } catch (error) {
        console.error('Error adding role: ', error);
    }
};

// function to add an employee
const addEmployee = async () => {
    try {
        const roles = await query('SELECT * FROM role');
        const employees = await query('SELECT * FROM employee');
        const employee = await inquirer.prompt([
            {
                type: 'input',
                name: 'first_name',
                message: 'Enter the first name of the employee:'
            },
            {
                type: 'input',
                name: 'last_name',
                message: 'Enter the last name of the employee:'
            },
            {
                type: 'list',
                name: 'role_id',
                message: 'Select the role for this employee:',
                choices: roles.map(role => ({ name: role.title, value: role.id }))
            },
            {
                type: 'list',
                name: 'manager_id',
                message: 'Select the manager for this employee:',
                choices: [{ name: 'None', value: null }, ...employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))]
            }
        ]);
        await query('INSERT INTO employee SET ?', employee);
        console.log('Employee added successfully!');
        startApp();
    } catch (error) {
        console.error('Error adding employee: ', error);
    }
};

// function to update an employee role
const updateEmployeeRole = async () => {
    try {
        const employees = await query('SELECT * FROM employee');
        const roles = await query('SELECT * FROM role');
        const employeeToUpdate = await inquirer.prompt([
            {
                type: 'list',
                name: 'id',
                message: 'Select the employee you want to update:',
                choices: employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
            },
            {
                type: 'list',
                name: 'role_id',
                message: 'Select the new role for this employee:',
                choices: roles.map(role => ({ name: role.title, value: role.id }))
            }
        ]);
        await query('UPDATE employee SET role_id = ? WHERE id = ?', [employeeToUpdate.role_id, employeeToUpdate.id]);
        console.log('Employee role updated successfully!');
        startApp();
    } catch (error) {
        console.error('Error updating employee role: ', error);
    }
};

module.exports = {
    viewDepartments,
    viewRoles,
    viewEmployees,
    addDepartment,
    addRole,
    addEmployee,
    updateEmployeeRole
};
