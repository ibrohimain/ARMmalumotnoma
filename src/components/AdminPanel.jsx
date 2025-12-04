// src/components/AdminPanel.jsx
import { useState, useEffect } from "react";
import { db, auth } from "../firebase/config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function AdminPanel() {
  const [kitoblar, setKitoblar] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKitoblar = async () => {
      const snapshot = await getDocs(collection(db, "kitoblar"));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // sana bo‘yicha teskari tartibda
      data.sort((a, b) => (b.topshirilganVaqt?.toDate() || 0) - (a.topshirilganVaqt?.toDate() || 0));
      setKitoblar(data);
      setLoading(false);
    };
    fetchKitoblar();
  }, []);

  const filtered = kitoblar.filter(item =>
    item.kitobNomi?.toLowerCase().includes(search.toLowerCase()) ||
    item.muallif?.toLowerCase().includes(search.toLowerCase()) ||
    item.topsiruvchiFIO?.toLowerCase().includes(search.toLowerCase()) ||
    item.raqam?.includes(search)
  );

  const handleDelete = async (id) => {
    if (window.confirm("Bu kitobni ro‘yxatdan o‘chirishni xohlaysizmi?")) {
      await deleteDoc(doc(db, "kitoblar", id));
      setKitoblar(prev => prev.filter(k => k.id !== id));
    }
  };

  const exportCSV = () => {
    const headers = ["№", "Sana", "F.I.O", "Lavozimi", "Kitob nomi", "Muallif", "Fan", "ISBN", "Telefon"];
    const rows = filtered.map(k => [
      k.raqam,
      k.topshirilganVaqt?.toDate().toLocaleDateString("uz-UZ") || "",
      k.topsiruvchiFIO,
      k.lavozim || "",
      k.kitobNomi,
      k.muallif,
      k.fanNomi,
      k.isbn || "",
      k.telefon || ""
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach(row => csv += row.join(",") + "\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Kitoblar_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const handleLogout = () => {
    signOut(auth);
    window.location.href = "/";
  };

  if (loading) return <div className="text-center py-20 text-2xl">Yuklanmoqda...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-indigo-700">Admin Panel</h1>
  
  <div className="flex gap-4">
    {/* YANGI TUGMA – KITOB QO‘SHISH */}
    <button
      onClick={() => window.location.href = "/add-book"}
      className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition transform hover:scale-105"
    >
      + Yangi kitob qo‘shish
    </button>

    <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl">
      Chiqish
    </button>
  </div>
          </div>

          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Qidirish: kitob, muallif, F.I.O, raqam..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-5 py-3 border rounded-xl text-lg"
            />
            <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold">
              Excel yuklab olish
            </button>
          </div>

          <div className="text-right text-gray-600 mb-4">
            Jami: {filtered.length} ta kitob
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-indigo-700 text-white">
              <tr>
                <th className="px-6 py-4 text-left">№</th>
                <th className="px-6 py-4 text-left">Sana</th>
                <th className="px-6 py-4 text-left">F.I.O</th>
                <th className="px-6 py-4 text-left">Kitob nomi</th>
                <th className="px-6 py-4 text-left">Muallif</th>
                <th className="px-6 py-4 text-left">Fan</th>
                <th className="px-6 py-4 text-left">Telefon</th>
                <th className="px-6 py-4 text-center">Amal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((kitob) => (
                <tr key={kitob.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-indigo-600">{kitob.raqam}</td>
                  <td className="px-6 py-4">{kitob.topshirilganVaqt?.toDate().toLocaleDateString("uz-UZ")}</td>
                  <td className="px-6 py-4">{kitob.topsiruvchiFIO}</td>
                  <td className="px-6 py-4 max-w-xs truncate" title={kitob.kitobNomi}>{kitob.kitobNomi}</td>
                  <td className="px-6 py-4">{kitob.muallif}</td>
                  <td className="px-6 py-4">{kitob.fanNomi}</td>
                  <td className="px-6 py-4">{kitob.telefon || "—"}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(kitob.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      O‘chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}