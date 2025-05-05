// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PayrollEscrow {
    address public employer;

    struct Employee {
        uint256 salary;
        uint256 lastPaid;
        bool active;
    }

    mapping(address => Employee) public employees;

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
    }

    function removeEmployee(address _employee) external onlyEmployer {
        require(employees[_employee].active, "Employee not active");
        employees[_employee].active = false;
    }

    function deposit() external payable onlyEmployer {}

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
}
