import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="mt-6 bg-gray-900 p-6 rounded-xl shadow-md text-white">
      <h2 className="text-lg font-semibold">📋 Lista Transazioni</h2>
      {transactions.length > 0 ? (
        <ul className="space-y-2 mt-4">
          {transactions.map((t) => (
            <li key={t.id} className="bg-gray-800 p-3 rounded-lg flex justify-between">
              <span>{t.date} - <strong>{t.category}</strong></span>
              <span className="text-green-400">€{t.amount} ({t.type})</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 mt-2">Nessuna transazione trovata.</p>
      )}
    </div>
  );
}
