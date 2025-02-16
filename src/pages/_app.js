// _app.js
import "../styles/globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import UserProfile from "../components/UserProfile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <header className="p-4 bg-gray-900">
        <UserProfile />
      </header>
      <Component {...pageProps} />
      <ToastContainer position="top-center" autoClose={3000} />
    </AuthProvider>
  );
}

export default MyApp;
