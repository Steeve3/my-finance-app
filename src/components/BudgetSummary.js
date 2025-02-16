// components/BudgetSummary.js
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";

export default function BudgetSummary() {
  const { user } = useAuth();
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchBudget = async () => {
      const q = query(collection(db, "budgets"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setBudget(querySnapshot.docs[0].data());
      }
    };

    fetchBudget();
  }, [user]);

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <h2 className="text-lg font-bold">Riassunto del Budget</h2>
      {budget ? (
        <div>
          <p><strong>Entrate Totali:</strong> €{budget.inflow.total}</p>
          <p><strong>Uscite Totali:</strong> €{budget.outflow.total}</p>
          <p><strong>Risparmi:</strong> €{budget.retainedEarnings}</p>
        </div>
      ) : (
        <p className="text-gray-500">Nessun budget trovato</p>
      )}
    </div>
  );
}
