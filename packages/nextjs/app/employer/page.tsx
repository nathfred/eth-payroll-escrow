'use client';

import { useState, useEffect } from "react";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

export default function EmployerPage() {
  const [employeeAddress, setEmployeeAddress] = useState("");
  const [salary, setSalary] = useState("");
  const [balance, setBalance] = useState("Loading...");

  const { data: contract } = useScaffoldContract({ contractName: "PayrollEscrow" });

  const fetchContractBalance = async () => {
    if (!contract) return;
    const raw = await contract.read.getContractBalance();
    setBalance(`${Number(raw) / 1e18} ETH`);
  };

  useEffect(() => {
    fetchContractBalance();
  }, [contract]);

  const addEmployee = async () => {
    if (!contract || !employeeAddress || !salary) return;
    await contract.write.addEmployee([employeeAddress, BigInt(salary)]);
    await fetchContractBalance(); // Optional: refresh after add
  };

  const deposit = async () => {
    if (!contract || !salary) return;
    await contract.write.deposit([], {
      value: BigInt(salary) * 10n ** 18n,
    });
    await fetchContractBalance(); // Optional: refresh after deposit
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
