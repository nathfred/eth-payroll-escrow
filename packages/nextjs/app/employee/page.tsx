"use client";

import { useState, useEffect } from "react";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";

export default function EmployeePage() {
  const { address } = useAccount();

  const [readableDate, setReadableDate] = useState<string>("Loading...");
  const [loading, setLoading] = useState<boolean>(false);

  const { data: contract } = useScaffoldContract({ contractName: "PayrollEscrow" });
  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "PayrollEscrow" });

  const getNextPayDate = async (): Promise<string> => {
    if (!contract || !address) return "Unavailable";
    try {
      const nextPayDate: bigint = await contract.read.getNextPayDate([address]);
      const date = new Date(Number(nextPayDate) * 1000).toLocaleDateString();
      return date;
    } catch (error) {
      console.error("Error getting next pay date:", error);
      return "Error fetching";
    }
  };

  const withdrawSalary = async () => {
    if (!contract) return;
    try {
      setLoading(true);

      await writeContractAsync({
        functionName: "withdrawSalary"
      });

      const updatedDate = await getNextPayDate();
      setReadableDate(updatedDate);
    } catch (error) {
      console.error("Withdrawal failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const date = await getNextPayDate();
      setReadableDate(date);
    })();
  }, [contract, address]);

  return (
    <div className="p-5 space-y-4">
      <h1 className="text-2xl font-bold">Employee Dashboard</h1>

      <div>
        <h2 className="text-lg">Next Pay Date:</h2>
        <p>{readableDate}</p>
      </div>

      <button
        className={`btn btn-success mt-4 ${loading ? "btn-disabled" : ""}`}
        onClick={withdrawSalary}
        disabled={loading}
      >
        {loading ? "Processing..." : "Withdraw Salary"}
      </button>
    </div>
  );
}
