// pages/login.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { signUp, logIn, logOut, signInWithGoogle } from "../config/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        router.push("/")
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await signUp(email, password);
      setUser(newUser);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLogIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await logIn(email, password);
      setUser(loggedInUser);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const googleUser = await signInWithGoogle();
      setUser(googleUser);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLogOut = async () => {
    await logOut();
    setUser(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-lg text-white">
        <h2 className="text-2xl font-semibold text-center mb-6">
          {user ? `Welcome, ${user.displayName || user.email}` : "Login or Sign Up"}
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        {!user ? (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 mb-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 mb-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              onClick={handleLogIn}
              disabled={loading}
              className="w-full py-3 mb-2 bg-blue-600 hover:bg-blue-700 transition rounded-lg font-semibold"
            >
              Log In
            </button>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 transition rounded-lg font-semibold"
            >
              Sign Up
            </button>
            <div className="border-t border-gray-600 my-4"></div>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 bg-red-500 hover:bg-red-600 transition rounded-lg font-semibold flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M23.98 12.24c0-.82-.07-1.57-.18-2.31H12.24v4.37h6.57c-.31 1.6-1.14 2.95-2.32 3.88v3.21h3.73c2.18-2.02 3.45-4.99 3.45-8.15z" fill="#4285F4"/>
                <path d="M12.24 24c3.24 0 5.94-1.08 7.92-2.92l-3.73-3.21c-1.02.7-2.3 1.12-3.75 1.12-2.89 0-5.34-1.95-6.23-4.57H1.21v3.16c1.98 3.93 6.06 6.62 11.03 6.62z" fill="#34A853"/>
                <path d="M6.01 14.64c-.46-1.38-.46-2.85 0-4.23V7.25H1.21a11.98 11.98 0 000 9.53l4.8-2.14z" fill="#FBBC05"/>
                <path d="M12.24 4.85c1.58 0 3 .58 4.14 1.71l3.07-3.07C17.57 1.16 15.03 0 12.24 0 7.27 0 3.19 2.7 1.21 6.62l4.8 2.14c.89-2.62 3.34-4.57 6.23-4.57z" fill="#EA4335"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleLogOut}
            className="w-full py-3 bg-gray-600 hover:bg-gray-700 transition rounded-lg font-semibold"
          >
            Log Out
          </button>
        )}
      </div>
    </div>
  );
}
