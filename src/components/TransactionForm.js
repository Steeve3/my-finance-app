import { useState } from "react";
import { db } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function TransactionForm() {
  const [date, setDate] = useState("");
  const [category, setCategory] = useState(""); // Cambiato in menu a tendina
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Fixed");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "transactions"), {
      date,
      category,
      description,
      amount: parseFloat(amount),
      type,
      createdAt: serverTimestamp(),
    });
    setDate("");
    setCategory("");
    setDescription("");
    setAmount("");
    setType("Fixed");
  };

  // Categorie predefinite dal tuo budget
  const categories = {
    Inflow: ["Entrate", "Stipendio Stage", "Liquidità Iniziale"],
    "Spese Fisse": ["Trasporti", "Abbonamenti"],
    "Spese Variabili": ["Trasporti", "Cibo", "Uscite/Svago", "Shopping/Altro"],
    Investimenti: ["Conto deposito", "Fondo emergenza"],
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-xl shadow-md text-white space-y-4">
      <h2 className="text-lg font-semibold">💰 Gestione Transazioni</h2>

      <div className="grid grid-cols-2 gap-4">
        <input type="date" className="p-2 rounded bg-gray-800 text-white" value={date} onChange={(e) => setDate(e.target.value)} required />
        <select className="p-2 rounded bg-gray-800 text-white" value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">Categoria</option>
          {Object.entries(categories).map(([group, options]) => (
            <optgroup key={group} label={group}>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <input type="text" className="w-full p-2 rounded bg-gray-800 text-white" placeholder="Descrizione" value={description} onChange={(e) => setDescription(e.target.value)} required />

      <div className="grid grid-cols-2 gap-4">
        <input type="number" className="p-2 rounded bg-gray-800 text-white" placeholder="Importo (€)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <select className="p-2 rounded bg-gray-800 text-white" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Fixed">Fixed</option>
          <option value="Variable">Variable</option>
          <option value="Investimento">Investimento</option>
        </select>
      </div>

      <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl w-full">
        Aggiungi Transazione
      </button>
    </form>
  );
}
