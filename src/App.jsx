// src/App.jsx  ← TO‘LIQ SHU BILAN ALMASHTIR

import { useState, useEffect } from "react";
import { auth } from "./firebase/config";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import BookUploadForm from "./components/BookUploadForm";
import AdminPanel from "./components/AdminPanel";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert("Email yoki parol xato! Yoki foydalanuvchi mavjud emas.");
    }
  };

  // ADMIN EMAIL RO‘YXATI – BU YERGA O‘ZINGNI YOZ!
  const adminEmails = [
    "admin@jizpi.uz",
    "arm@jizpi.uz",
    "alijon@gmail.com",        // O‘Z EMAILINGNI BU YERGA QO‘SH!
    "testadmin@gmail.com",
    "umarabdullayev338@gmail.com"
  ];

  if (loading) return <div className="flex items-center justify-center h-screen text-2xl">Yuklanmoqda...</div>;

  // Agar admin bo‘lsa – admin panel
 if (user && adminEmails.includes(user.email)) {
    if (window.location.pathname === "/add-book") {
      return <BookUploadForm />;
    }
    return <AdminPanel/>;
  }

  // Agar kirgan bo‘lsa, lekin admin emas – oddiy forma
  if (user) {
    return <BookUploadForm />;
  }

  // Hech kim kirmagan – login sahifasi
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center text-indigo-700 mb-10">
          Elektron kutubxona tizimi
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            placeholder="Email (masalan: admin@jizpi.uz)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Parol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500 focus:outline-none"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xl py-5 rounded-xl transition"
          >
            Kirish
          </button>
        </form>

        <div className="mt-8 text-center text-gray-600">
          <p>Admin kirish uchun:</p>
          <p className="font-mono text-sm mt-2">admin@jizpi.uz</p>
          <p className="font-mono text-sm">Parol: 123456</p>
        </div>
      </div>
    </div>
  );
}

export default App;