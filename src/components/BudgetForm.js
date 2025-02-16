// components/BudgetForm.js
import { useState } from "react";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

export default function BudgetForm({ budget, onSave, selectedMonth }) {
  const { user } = useAuth(); // Get the authenticated user
  const [salary, setSalary] = useState(budget?.inflow?.salary || "");
  const [initialBalance, setInitialBalance] = useState(budget?.inflow?.initialBalance || "");
  const [fixedExpenses, setFixedExpenses] = useState(budget?.outflow?.fixedExpenses?.total || "");
  const [variableExpenses, setVariableExpenses] = useState(budget?.outflow?.variableExpenses?.total || "");
  const [investments, setInvestments] = useState(budget?.outflow?.investments?.total || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const budgetData = {
      userId: user.uid, // Attach the user's UID
      month: selectedMonth,
      inflow: {
        salary: parseFloat(salary) || 0,
        initialBalance: parseFloat(initialBalance) || 0,
        total: (parseFloat(salary) || 0) + (parseFloat(initialBalance) || 0),
      },
      outflow: {
        fixedExpenses: { total: parseFloat(fixedExpenses) || 0 },
        variableExpenses: { total: parseFloat(variableExpenses) || 0 },
        investments: { total: parseFloat(investments) || 0 },
        total:
          (parseFloat(fixedExpenses) || 0) +
          (parseFloat(variableExpenses) || 0) +
          (parseFloat(investments) || 0),
      },
      retainedEarnings:
        ((parseFloat(salary) || 0) + (parseFloat(initialBalance) || 0)) -
        ((parseFloat(fixedExpenses) || 0) +
          (parseFloat(variableExpenses) || 0) +
          (parseFloat(investments) || 0)),
    };

    try {
      if (budget?.id) {
        await updateDoc(doc(db, "budgets", budget.id), budgetData);
      } else {
        await addDoc(collection(db, "budgets"), budgetData);
      }
      onSave(budgetData);
      toast.success("Budget salvato con successo!");
    } catch (error) {
      console.error("Error saving budget:", error);
      toast.error("Errore nel salvataggio. Riprova!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow-md rounded-md space-y-4">
      <h2 className="text-2xl font-bold text-yellow-400">Imposta Budget Mensile</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-800">Stipendio (€)</label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="border p-2 w-full rounded-md text-gray-900 placeholder-gray-500"
            placeholder="Inserisci stipendio"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800">Liquidità Iniziale (€)</label>
          <input
            type="number"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            className="border p-2 w-full rounded-md text-gray-900 placeholder-gray-500"
            placeholder="Inserisci saldo iniziale"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800">Spese Fisse (€)</label>
          <input
            type="number"
            value={fixedExpenses}
            onChange={(e) => setFixedExpenses(e.target.value)}
            className="border p-2 w-full rounded-md text-gray-900 placeholder-gray-500"
            placeholder="Inserisci spese fisse"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800">Spese Variabili (€)</label>
          <input
            type="number"
            value={variableExpenses}
            onChange={(e) => setVariableExpenses(e.target.value)}
            className="border p-2 w-full rounded-md text-gray-900 placeholder-gray-500"
            placeholder="Inserisci spese variabili"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-800">Investimenti (€)</label>
          <input
            type="number"
            value={investments}
            onChange={(e) => setInvestments(e.target.value)}
            className="border p-2 w-full rounded-md text-gray-900 placeholder-gray-500"
            placeholder="Inserisci investimenti"
            required
          />
        </div>
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md" disabled={loading}>
        {loading ? "Saving..." : "Salva Budget"}
      </button>
    </form>
  );
}
