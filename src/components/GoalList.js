import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function GoalList() {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'goals'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const g = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGoals(g);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Lista Obiettivi</h2>
      <ul className="space-y-2">
        {goals.map(goal => (
          <li 
            key={goal.id} 
            className="p-4 border rounded-md shadow-md hover:bg-gray-100 transition"
          >
            <h3 className="font-bold">{goal.description}</h3>
            <p>🎯 Target: €{goal.target.toFixed(2)}</p>
            <p>📅 Scadenza: {goal.deadline}</p>
            <p>📈 Progresso: €{goal.progress.toFixed(2)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
