import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function GoalForm() {
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'goals'), {
        description,
        target: parseFloat(target),
        deadline,
        progress: 0, // Progresso iniziale
        createdAt: serverTimestamp()
      });
      setDescription('');
      setTarget('');
      setDeadline('');
    } catch (error) {
      console.error("Errore durante l'aggiunta dell'obiettivo:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div>
        <label>Descrizione Obiettivo:</label>
        <input 
          type="text" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
          className="border p-2 rounded-md w-full"
        />
      </div>
      <div>
        <label>Target (€):</label>
        <input
          type="number"
          step="0.01"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          required
          className="border p-2 rounded-md w-full"
        />
      </div>
      <div>
        <label>Scadenza:</label>
        <input 
          type="date" 
          value={deadline} 
          onChange={(e) => setDeadline(e.target.value)} 
          required 
          className="border p-2 rounded-md w-full"
        />
      </div>
      <button 
        type="submit" 
        className={`mt-4 px-4 py-2 bg-blue-600 text-white rounded-md ${loading ? 'opacity-50' : ''}`} 
        disabled={loading}
      >
        {loading ? 'Caricamento...' : 'Aggiungi Obiettivo'}
      </button>
    </form>
  );
}
