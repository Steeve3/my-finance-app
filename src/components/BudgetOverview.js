// components/BudgetOverview.js
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export default function BudgetOverview({ userId, selectedMonth }) {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !selectedMonth) return;

    const fetchBudget = async () => {
      setLoading(true);
      try {
        const budgetRef = collection(db, "budgets");
        const q = query(
          budgetRef,
          where("userId", "==", userId),
          where("month", "==", selectedMonth)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setBudgetData(snapshot.docs[0].data());
        } else {
          setBudgetData(null);
        }
      } catch (error) {
        console.error("Error fetching budget data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudget();
  }, [userId, selectedMonth]);

  if (loading) return <p className="text-gray-800">Loading...</p>;
  if (!budgetData) return <p className="text-gray-800">No budget data available for this month.</p>;

  return (
    <div className="p-4 border rounded-md shadow-md bg-white w-full max-w-2xl my-4">
      <h2 className="text-2xl font-bold text-yellow-400 mb-2">Budget Overview - {selectedMonth}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-800">Entrate</h3>
          <p className="text-gray-800">Stipendio: <span className="text-green-400">€{budgetData.inflow.salary.toFixed(2)}</span></p>
          <p className="text-gray-800">Liquidità Iniziale: <span className="text-green-400">€{budgetData.inflow.initialBalance.toFixed(2)}</span></p>
          <p className="font-bold text-gray-800">Total Entrate: <span className="text-green-500">€{budgetData.inflow.total.toFixed(2)}</span></p>
        </div>
        <div>
          <h3 className="font-semibold text-lg text-gray-800">Uscite</h3>
          <p className="text-gray-800">Spese Fisse: <span className="text-red-400">€{budgetData.outflow.fixedExpenses.total.toFixed(2)}</span></p>
          <p className="text-gray-800">Spese Variabili: <span className="text-red-400">€{budgetData.outflow.variableExpenses.total.toFixed(2)}</span></p>
          <p className="text-gray-800">Investimenti: <span className="text-green-400">€{budgetData.outflow.investments.total.toFixed(2)}</span></p>
          <p className="font-bold text-gray-800">Total Uscite: <span className="text-red-500">€{budgetData.outflow.total.toFixed(2)}</span></p>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold text-lg text-gray-800">Risparmio Netto</h3>
        <p className="text-2xl font-bold text-green-600">€{budgetData.retainedEarnings.toFixed(2)}</p>
      </div>
    </div>
  );
}
