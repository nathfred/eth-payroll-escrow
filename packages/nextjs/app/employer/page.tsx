"use client";

import { useCallback, useEffect, useState } from "react";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function EmployerPage() {
  const [employeeAddress, setEmployeeAddress] = useState("");
  const [salary, setSalary] = useState("");
  const [balance, setBalance] = useState("Loading...");

  const { data: contract } = useScaffoldContract({ contractName: "PayrollEscrow" });
  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "PayrollEscrow" });

  const fetchContractBalance = useCallback(async () => {
    if (!contract) return;
    const raw = await contract.read.getContractBalance();
    setBalance(`${Number(raw) / 1e18} ETH`);
  }, [contract]);

  useEffect(() => {
    fetchContractBalance();
  }, [contract, fetchContractBalance]);
  const addEmployee = async () => {
    try {
      const parsedSalary = parseFloat(salary);
      if (!employeeAddress || isNaN(parsedSalary) || parsedSalary <= 0) {
        alert("Please enter valid employee address and salary.");
        return;
      }

      await writeContractAsync({
        functionName: "addEmployee",
        args: [employeeAddress, BigInt(parsedSalary * 1e18)],
      });

      await fetchContractBalance();
    } catch (err) {
      console.error("Failed to add employee:", err);
    }
  };

  const deposit = async () => {
    try {
      const parsedSalary = parseFloat(salary);
      if (isNaN(parsedSalary) || parsedSalary <= 0) {
        alert("Please enter a valid salary amount to deposit.");
        return;
      }

      await writeContractAsync({
        functionName: "deposit",
        value: BigInt(parsedSalary * 1e18),
      });

      await fetchContractBalance();
    } catch (err) {
      console.error("Failed to deposit:", err);
    }
  };

  return (
    <div className="p-5 space-y-4">
      <h1 className="text-2xl font-bold">Employer Dashboard</h1>

      <div>
        <input
          className="input input-bordered w-full max-w-sm"
          placeholder="Employee address"
          value={employeeAddress}
          onChange={e => setEmployeeAddress(e.target.value)}
        />
        <input
          className="input input-bordered w-full max-w-sm mt-2"
          placeholder="Monthly salary (in ETH)"
          value={salary}
          onChange={e => setSalary(e.target.value)}
        />

        <button className="btn btn-primary mt-3 mr-2" onClick={addEmployee}>
          Add Employee
        </button>

        <button className="btn btn-secondary mt-3" onClick={deposit}>
          Deposit ETH
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Contract Balance:</h2>
        <p>{balance}</p>
      </div>
    </div>
  );
}
