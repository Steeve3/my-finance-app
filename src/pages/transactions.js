// pages/transactions.js
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

export default function TransactionsPage() {
  return (
    <div style={{ padding: "1rem" }}>
      <h1>Gestione Transazioni</h1>
      <TransactionForm />
      <TransactionList />
    </div>
  );
}
