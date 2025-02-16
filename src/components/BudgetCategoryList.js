// components/BudgetCategoryList.js
export default function BudgetCategoryList({ categories }) {
  return (
    <div className="p-4 border rounded-md shadow-md bg-white w-full max-w-2xl my-4">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">Category Breakdown</h2>
      <ul className="space-y-4">
        {categories.map((cat) => {
          const remaining = cat.planned - cat.actual;
          const progressPercent = cat.planned ? Math.min((cat.actual / cat.planned) * 100, 100) : 0;
          return (
            <li key={cat.name} className="mb-2">
              <p className="font-semibold text-lg">{cat.name}</p>
              <div className="flex justify-between text-sm mb-1">
                <span>Planned: €{cat.planned.toFixed(2)}</span>
                <span>Actual: €{cat.actual.toFixed(2)}</span>
                <span>Remaining: €{remaining.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${cat.actual > cat.planned ? 'bg-red-600' : 'bg-green-600'}`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
