import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { db } from "../config/firebase";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  getDoc,
  setDoc,
} from "firebase/firestore";
import QuickTransactionModal from "../components/QuickTransactionModal";
import DynamicCircle from "../components/DynamicCircle";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

// Currency formatter (for Italian locale, EUR)
const formatCurrency = (value) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);

export default function Dashboard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [dynamicBudget, setDynamicBudget] = useState({
    inflow: 0,
    fixedExpenses: 0,
    variableExpenses: 0,
    deposit: 0,
    emergency: 0,
  });
  const [summary, setSummary] = useState({
    inflow: { budget: 0, actual: 0 },
    fixedExpenses: { budget: 0, actual: 0 },
    variableExpenses: { budget: 0, actual: 0 },
    deposit: { budget: 0, actual: 0 },
    emergency: { budget: 0, actual: 0 },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const budgetDocId = `${currentYear}-${currentMonth}`;

  // Listener for dynamic budget (assuming budgets are stored per user in a subcollection)
  useEffect(() => {
    if (!user) return;
    const budgetRef = doc(db, "users", user.uid, "budgets", budgetDocId);
    const unsubscribeBudget = onSnapshot(
      budgetRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDynamicBudget({
            inflow: data.inflow,
            fixedExpenses: data.fixedExpenses,
            variableExpenses: data.variableExpenses,
            deposit: data.deposit,
            emergency: data.emergency,
          });
        } else {
          setDynamicBudget({
            inflow: 0,
            fixedExpenses: 0,
            variableExpenses: 0,
            deposit: 0,
            emergency: 0,
          });
        }
      },
      (error) => console.error("Error fetching budget:", error)
    );
    return () => unsubscribeBudget();
  }, [budgetDocId, user]);

  // Listener for current month's transactions for the logged-in user
  useEffect(() => {
    if (!user) return;
    const transactionsRef = collection(db, "transactions");
    const q = query(transactionsRef, where("userId", "==", user.uid));
    const unsubscribeTrans = onSnapshot(
      q,
      (snapshot) => {
        const trans = [];
        let total = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          const transDate = new Date(data.date);
          if (
            transDate.getMonth() === now.getMonth() &&
            transDate.getFullYear() === now.getFullYear()
          ) {
            trans.push({ ...data, id: doc.id });
            if (
              ["Stipendio", "Entrate", "Liquidità Iniziale"].includes(data.category)
            ) {
              total += Number(data.amount);
            } else {
              total -= Number(data.amount);
            }
          }
        });
        setTransactions(trans);
        setBalance(total);
      },
      (error) => console.error("Error fetching transactions:", error)
    );
    return () => unsubscribeTrans();
  }, [now, user]);

  // Compute monthly summary only when transactions or dynamicBudget changes.
  const monthlySummary = useMemo(() => {
    const summaryCalc = {
      inflow: { budget: dynamicBudget.inflow, actual: 0 },
      fixedExpenses: { budget: dynamicBudget.fixedExpenses, actual: 0 },
      variableExpenses: { budget: dynamicBudget.variableExpenses, actual: 0 },
      deposit: { budget: dynamicBudget.deposit, actual: 0 },
      emergency: { budget: dynamicBudget.emergency, actual: 0 },
    };

    transactions.forEach((t) => {
      if (["Stipendio", "Entrate", "Liquidità Iniziale"].includes(t.category)) {
        summaryCalc.inflow.actual += Number(t.amount);
      } else if (["Trasporti", "Abbonamenti"].includes(t.category)) {
        summaryCalc.fixedExpenses.actual += Number(t.amount);
      } else if (["Cibo", "Uscite/Svago", "Shopping/Altro"].includes(t.category)) {
        summaryCalc.variableExpenses.actual += Number(t.amount);
      } else if (t.category === "Conto deposito") {
        summaryCalc.deposit.actual += Number(t.amount);
      } else if (t.category === "Fondo emergenza") {
        summaryCalc.emergency.actual += Number(t.amount);
      }
    });
    return summaryCalc;
  }, [transactions, dynamicBudget]);

  // Update summary state
  useEffect(() => {
    setSummary(monthlySummary);
  }, [monthlySummary]);

  // Define values for the interactive circles.
  const liquidi = summary.inflow.actual || 0;
  const deposito = summary.deposit.actual || 0;
  const emergenza = summary.emergency.actual || 0;
  const maxLiquidi = dynamicBudget.inflow || 1;
  const maxDeposito = dynamicBudget.deposit || 1;
  const maxEmergenza = dynamicBudget.emergency || 1;

  // Save handler with toast notification (prevents multiple notifications via disabled state in form)
  const handleSaveBudget = async (newBudget) => {
    if (!user) {
      console.log("No user found, skipping budget save.");
      return;
    }
    console.log("Saving new budget:", newBudget);
    const budgetRef = doc(db, "budgets", `${user.uid}_${currentYear}-${currentMonth}`);
    try {
      await setDoc(budgetRef, newBudget, { merge: true });
      console.log("Budget successfully saved in Firestore.");
      toast.success("Budget salvato con successo!");
    } catch (error) {
      console.error("Error saving budget:", error);
      toast.error("Errore nel salvataggio. Riprova!");
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 sm:p-6 md:p-8">
      <h1 className="text-4xl font-extrabold text-center text-yellow-300">📊 Dashboard</h1>
      <h2 className="text-2xl mt-4 text-center">
        Saldo attuale: <span className="text-green-400">{formatCurrency(balance || 0)}</span>
      </h2>

      {/* Interactive circle chart */}
      <div className="mt-8 flex flex-wrap justify-around gap-4">
        <DynamicCircle
          label="Liquidi"
          value={liquidi}
          maxValue={maxLiquidi}
          onClick={() => alert("Dettagli: Liquidi (saldo disponibile)")}
          className="bg-blue-700"
        />
        <DynamicCircle
          label="Deposito"
          value={deposito}
          maxValue={maxDeposito}
          onClick={() => alert("Dettagli: Deposito (conto deposito)")}
          className="bg-green-700"
        />
        <DynamicCircle
          label="Emergenza"
          value={emergenza}
          maxValue={maxEmergenza}
          onClick={() => alert("Dettagli: Fondo Emergenza")}
          className="bg-red-700"
        />
      </div>

      {/* Quick Transaction Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-800 transition rounded-full shadow-xl text-xl font-bold"
        >
          Aggiungi Transazione Rapida
        </button>
      </div>

      {/* Navigation Buttons */}
      <nav className="mt-8 flex justify-center space-x-6">
        <Link href="/budget">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-800 transition rounded-lg shadow-lg text-lg font-semibold">
            🎯 Vai a Budget
          </button>
        </Link>
        <Link href="/transactions">
          <button className="px-4 py-2 bg-green-600 hover:bg-green-800 transition rounded-lg shadow-lg text-lg font-semibold">
            📜 Vai a Transazioni
          </button>
        </Link>
      </nav>

      {/* Dynamic Budget Component */}
      <section className="mt-12">
        <h3 className="text-2xl font-bold text-yellow-300 text-center mb-4">📅 Riassunto del Mese</h3>
        <div className="flex flex-wrap justify-center gap-4 w-full">
          {Object.entries(summary).map(([key, value]) => (
            <div key={key} className="bg-gray-800 p-4 rounded-lg shadow-lg w-64">
              <h4 className="font-bold capitalize mb-2 text-gray-100">
                {key === "inflow"
                  ? "Entrate"
                  : key === "fixedExpenses"
                  ? "Spese Fisse"
                  : key === "variableExpenses"
                  ? "Spese Variabili"
                  : key === "deposit"
                  ? "Conto Deposito"
                  : "Fondo Emergenza"}
              </h4>
              <p className="text-gray-100">Budget: {formatCurrency(value.budget || 0)}</p>
              <p className="text-gray-100">Effettivo: {formatCurrency(value.actual || 0)}</p>
              <p className={`font-bold ${value.actual - value.budget >= 0 ? "text-green-400" : "text-red-400"}`}>
                Differenza: {formatCurrency(value.actual - value.budget)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="mt-12">
        <h3 className="text-2xl font-bold text-center mb-4">🔄 Transazioni recenti</h3>
        <ul className="space-y-2">
          {transactions.length > 0 ? (
            transactions.map((t) => (
              <li
                key={t.id}
                className="border-b border-gray-700 py-2 flex justify-between items-center px-4"
              >
                <span className="text-gray-400">{t.date}</span>
                <span className="font-semibold text-gray-100">{t.category}</span>
                <span className={`ml-2 font-bold ${t.type === "income" ? "text-green-400" : "text-red-400"}`}>
                  {formatCurrency(t.amount)}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-500 text-center">Nessuna transazione trovata.</p>
          )}
        </ul>
      </section>

      {/* Quick Transaction Modal */}
      <QuickTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
