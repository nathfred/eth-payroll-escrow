// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PayrollEscrow {
    address public employer;

    struct Employee {
        uint256 salary;     // Monthly salary in wei
        uint256 lastPaid;   // Timestamp of last payment
        bool active;        // Is employee currently employed
    }

    mapping(address => Employee) public employees;
    address[] public employeeList;

    constructor() {
        employer = msg.sender;
    }

    modifier onlyEmployer() {
        require(msg.sender == employer, "Only employer can perform this action");
        _;
    }

    function addEmployee(address _employee, uint256 _monthlySalary) external onlyEmployer {
        require(_employee != address(0), "Invalid address");
        require(_monthlySalary > 0, "Salary must be > 0");
        require(!employees[_employee].active, "Employee already added");

        employees[_employee] = Employee({
            salary: _monthlySalary,
            lastPaid: block.timestamp,
            active: true
        });

        employeeList.push(_employee); // Store for iteration
    }

    function removeEmployee(address _employee) external onlyEmployer {
        require(employees[_employee].active, "Employee not active");
        employees[_employee].active = false;
        // Optionally: clean up or remove from employeeList
    }

    /// @notice Deposit must cover one month salary for all active employees
    function deposit() external payable onlyEmployer {
        uint256 totalMonthlySalaries = 0;

        for (uint256 i = 0; i < employeeList.length; i++) {
            address empAddr = employeeList[i];
            if (employees[empAddr].active) {
                totalMonthlySalaries += employees[empAddr].salary;
            }
        }

        require(msg.value >= totalMonthlySalaries, "Insufficient deposit for payroll");
        // Excess ETH is okay and stays in the contract
    }

    function withdrawSalary() external {
        Employee storage emp = employees[msg.sender];
        require(emp.active, "Not an active employee");

        uint256 nextPayTime = emp.lastPaid + 30 days;
        require(block.timestamp >= nextPayTime, "Too early to withdraw salary");

        emp.lastPaid = block.timestamp;

        (bool success, ) = msg.sender.call{value: emp.salary}("");
        require(success, "Payment failed");
    }

    function getNextPayDate(address _employee) external view returns (uint256) {
        require(employees[_employee].active, "Employee not active");
        return employees[_employee].lastPaid + 30 days;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getEmployeeCount() external view returns (uint256) {
        return employeeList.length;
    }

    function getEmployeeAt(uint256 index) external view returns (address) {
        require(index < employeeList.length, "Index out of bounds");
        return employeeList[index];
    }
}
