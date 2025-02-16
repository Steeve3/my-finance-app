import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import BudgetForm from '../components/BudgetForm'; // Default import
import BudgetOverview from '../components/BudgetOverview'; // Default import
import BudgetCategoryList from '../components/BudgetCategoryList'; // Default import
// src\components\BudgetCategoryList

// Debugging: Check if components are correctly imported
console.log("BudgetForm:", BudgetForm);
console.log("BudgetOverview:", BudgetOverview);
console.log("BudgetCategoryList:", BudgetCategoryList);

export default function BudgetPage() {
  const { user } = useAuth();  // Access user from AuthContext
  console.log("User from AuthContext:", user); // Debugging: Check if user is available

  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM format

  useEffect(() => {
    if (!user) {
      console.log("No user found, skipping budget fetch."); // Debugging: If user is null, we stop
      return;
    }

    const fetchBudget = async () => {
      console.log("Fetching budget for user:", user.uid);
      const budgetRef = doc(db, 'budgets', `${user.uid}_${month}`);
      console.log("Budget document reference:", budgetRef.path);

      try {
        const snapshot = await getDoc(budgetRef);
        if (snapshot.exists()) {
          console.log("Firestore budget data:", snapshot.data());
          setBudget(snapshot.data());
        } else {
          console.log("No budget data found in Firestore, initializing empty budget.");
          setBudget({ expectedIncome: 0, expectedExpenses: {} });
        }
      } catch (error) {
        console.error("Error fetching budget:", error);
      }

      setLoading(false);
    };

    fetchBudget();
  }, [user, month]); // Re-run when user or month changes

  const handleSaveBudget = async (newBudget) => {
    if (!user) {
      console.log("No user found, skipping budget save.");
      return;
    }

    console.log("Saving new budget:", newBudget);
    const budgetRef = doc(db, 'budgets', `${user.uid}_${month}`);

    try {
      await setDoc(budgetRef, newBudget, { merge: true });
      console.log("Budget successfully saved in Firestore.");
      setBudget(newBudget);
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };

  console.log("Rendering BudgetPage with budget:", budget);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold">Budget per {month}</h1>
      {loading ? <p>Loading...</p> : (
        <>
          {budget && (
            <>
              <BudgetForm budget={budget} onSave={handleSaveBudget} selectedMonth={month} />
              <BudgetOverview userId={user.uid} selectedMonth={month} />
              <BudgetCategoryList categories={budget.categories || []} />
            </>
          )}
        </>
      )}
    </div>
  );
}
