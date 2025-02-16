import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { logOut } from "../config/auth"; // La funzione logOut che hai già definito

export default function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (!user) return null; // Se non è loggato, non mostra nulla (oppure puoi mostrare un link al login)

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between">
      <div>
        <p className="text-lg font-semibold">
          Benvenuto, {user.displayName || user.email}
        </p>
      </div>
      <button
        onClick={async () => await logOut()}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 transition rounded-lg text-white"
      >
        Logout
      </button>
    </div>
  );
}
