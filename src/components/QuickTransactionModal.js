import { useState } from "react";
import { db } from "../config/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function QuickTransactionModal({ isOpen, onClose }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date().toISOString().split("T")[0]; // Formato "YYYY-MM-DD"

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Se il modulo è già in invio, non fare nulla
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const newTransaction = {
        date: today,
        category,
        description,
        amount: parseFloat(amount),
        type: ["Stipendio", "Entrate", "Liquidità Iniziale"].includes(category)
          ? "income"
          : "expense",
        createdAt: serverTimestamp(),
      };
      // Aggiunge la transazione a Firestore
      await addDoc(collection(db, "transactions"), newTransaction);
      // Pulisce i campi
      setAmount("");
      setCategory("");
      setDescription("");
      // Chiude il modal solo dopo il completamento
      onClose();
    } catch (error) {
      console.error("Errore durante l'aggiunta della transazione:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white rounded-xl p-6 w-11/12 max-w-md animate-fadeIn">
        <h2 className="text-xl font-bold mb-4">Aggiungi Transazione Rapida</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 rounded bg-gray-700"
              required
            >
              <option value="">Seleziona categoria</option>
              <option value="Entrate">Entrate</option>
              <option value="Stipendio">Stipendio</option>
              <option value="Liquidità Iniziale">Liquidità Iniziale</option>
              <option value="Trasporti">Trasporti</option>
              <option value="Abbonamenti">Abbonamenti</option>
              <option value="Cibo">Cibo</option>
              <option value="Uscite/Svago">Uscite/Svago</option>
              <option value="Shopping/Altro">Shopping/Altro</option>
              <option value="Conto deposito">Conto deposito</option>
              <option value="Fondo emergenza">Fondo emergenza</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Importo (€)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 rounded bg-gray-700"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Descrizione</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded bg-gray-700"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
              disabled={isSubmitting}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Inviando..." : "Aggiungi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
