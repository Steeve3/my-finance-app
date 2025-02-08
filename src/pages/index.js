import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import {
  collection,
  doc,
  onSnapshot,
} from "firebase/firestore";
import QuickTransactionModal from "../components/QuickTransactionModal";
import DynamicCircle from "../components/DynamicCircle";

export default function Dashboard() {
  // Stati per transazioni, saldo, budget dinamico, riassunto e modal
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
  const currentMonth = now.getMonth() + 1; // getMonth() parte da 0
  const currentYear = now.getFullYear();
  const budgetDocId = `${currentYear}-${currentMonth}`;

  // Listener per il budget dinamico
  useEffect(() => {
    const budgetRef = doc(db, "budgets", budgetDocId);
    const unsubscribeBudget = onSnapshot(budgetRef, (docSnap) => {
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
    });
    return () => unsubscribeBudget();
  }, [budgetDocId]);

  // Listener per le transazioni del mese corrente
  useEffect(() => {
    const transactionsRef = collection(db, "transactions");
    const unsubscribeTrans = onSnapshot(transactionsRef, (snapshot) => {
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
    });
    return () => unsubscribeTrans();
  }, [now]);

  // Calcola il riassunto mensile combinando il budget dinamico e le transazioni
  useEffect(() => {
    const monthlySummary = {
      inflow: { budget: dynamicBudget.inflow, actual: 0 },
      fixedExpenses: { budget: dynamicBudget.fixedExpenses, actual: 0 },
      variableExpenses: { budget: dynamicBudget.variableExpenses, actual: 0 },
      deposit: { budget: dynamicBudget.deposit, actual: 0 },
      emergency: { budget: dynamicBudget.emergency, actual: 0 },
    };

    transactions.forEach((t) => {
      if (["Stipendio", "Entrate", "Liquidità Iniziale"].includes(t.category)) {
        monthlySummary.inflow.actual += Number(t.amount);
      } else if (["Trasporti", "Abbonamenti"].includes(t.category)) {
        monthlySummary.fixedExpenses.actual += Number(t.amount);
      } else if (["Cibo", "Uscite/Svago", "Shopping/Altro"].includes(t.category)) {
        monthlySummary.variableExpenses.actual += Number(t.amount);
      } else if (t.category === "Conto deposito") {
        monthlySummary.deposit.actual += Number(t.amount);
      } else if (t.category === "Fondo emergenza") {
        monthlySummary.emergency.actual += Number(t.amount);
      }
    });
    setSummary(monthlySummary);
  }, [transactions, dynamicBudget]);

  // Definisci i valori per i cerchi:
  // Qui assumiamo che "Liquidi" corrisponda alle entrate (cash disponibili)
  const liquidi = summary.inflow.actual || 0;
  const deposito = summary.deposit.actual || 0;
  const emergenza = summary.emergency.actual || 0;
  // Per il dimensionamento dei cerchi, usiamo i budget dinamici come riferimento (minimo 1 per evitare divisioni per 0)
  const maxLiquidi = dynamicBudget.inflow || 1;
  const maxDeposito = dynamicBudget.deposit || 1;
  const maxEmergenza = dynamicBudget.emergency || 1;

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold text-center">📊 Dashboard</h1>
      <h2 className="text-xl mt-4 text-center">
        Saldo attuale: <span className="text-green-400">€{(balance || 0).toFixed(2)}</span>
      </h2>

      {/* Grafico a cerchi interattivi */}
      <div className="mt-6 flex justify-around">
        <DynamicCircle 
          label="Liquidi"
          value={liquidi}
          maxValue={maxLiquidi}
          onClick={() => alert("Dettagli: Liquidi (saldo disponibile)")}
        />
        <DynamicCircle 
          label="Deposito"
          value={deposito}
          maxValue={maxDeposito}
          onClick={() => alert("Dettagli: Deposito (conto deposito)")}
        />
        <DynamicCircle 
          label="Emergenza"
          value={emergenza}
          maxValue={maxEmergenza}
          onClick={() => alert("Dettagli: Fondo Emergenza")}
        />
      </div>

      {/* Pulsante per aggiungere una transazione rapida */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 transition rounded-full shadow-lg text-lg font-semibold"
        >
          Aggiungi Transazione Rapida
        </button>
      </div>

      {/* Bottoni di navigazione */}
      <nav className="mt-6 flex justify-center space-x-4">
        <Link href="/goals">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition rounded-lg shadow-md">
            🎯 Vai a Goals
          </button>
        </Link>
        <Link href="/transactions">
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 transition rounded-lg shadow-md">
            📜 Vai a Transazioni
          </button>
        </Link>
      </nav>

      {/* Tabella riassuntiva del mese corrente */}
      <section className="mt-8">
        <h3 className="text-lg font-semibold">📅 Riassunto del Mese</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-700 mt-2">
            <thead>
              <tr className="bg-gray-800">
                <th className="px-4 py-2 text-left">Categoria</th>
                <th className="px-4 py-2 text-right">Budget (€)</th>
                <th className="px-4 py-2 text-right">Effettivo (€)</th>
                <th className="px-4 py-2 text-right">Differenza (€)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary).map(([key, value]) => (
                <tr key={key} className="border-b border-gray-700">
                  <td className="px-4 py-2">
                    {key === "inflow"
                      ? "Entrate"
                      : key === "fixedExpenses"
                      ? "Spese Fisse"
                      : key === "variableExpenses"
                      ? "Spese Variabili"
                      : key === "deposit"
                      ? "Conto Deposito"
                      : "Fondo Emergenza"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    €{(value.budget || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    €{(value.actual|| 0).toFixed(2)}
                  </td>
                  <td
                    className={`px-4 py-2 text-right ${
                      value.actual - value.budget >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    €{(value.actual - value.budget).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sezione transazioni recenti */}
      <section className="mt-6">
        <h3 className="text-lg font-semibold">🔄 Transazioni recenti</h3>
        <ul className="mt-2 space-y-2">
          {transactions.length > 0 ? (
            transactions.map((t) => (
              <li
                key={t.id}
                className="border-b border-gray-700 py-2 flex justify-between"
              >
                <span className="text-gray-400">{t.date}</span>
                <span className="font-semibold">{t.category}</span>
                <span
                  className={`ml-2 ${
                    t.type === "income" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  €{t.amount}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">Nessuna transazione trovata.</p>
          )}
        </ul>
      </section>

      {/* Modal per aggiungere transazione rapida */}
      <QuickTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
