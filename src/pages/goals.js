import GoalForm from '../components/GoalForm';
import GoalList from '../components/GoalList';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function GoalsPage({ goals }) {
  return (
    <div style={{ padding: "1rem" }}>
      <h1>Obiettivi</h1>
      <GoalForm />
      <GoalList initialGoals={goals} />
    </div>
  );
}

// Recupera i dati dal database al momento del caricamento della pagina
export async function getServerSideProps() {
  const goalsRef = collection(db, 'goals');
  const q = query(goalsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  const goals = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    props: { goals }, // Passa i dati alla pagina come prop
  };
}
