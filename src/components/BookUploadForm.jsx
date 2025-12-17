// src/components/BookUploadForm.jsx
import { useState } from "react";
import { auth, db } from "../firebase/config";
import { collection, addDoc, runTransaction, doc } from "firebase/firestore";
import GeneratePDFs from "./GeneratePDFs";
import { Loader2, Plus, Trash2 } from "lucide-react";

export default function BookUploadForm() {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [raqamlar, setRaqamlar] = useState([]);

  const [topshiruvchi, setTopshiruvchi] = useState({
    topshiruvchiFIO: "",
    lavozim: "",
    kafedra: "",
    telefon: "",
  });

  const [kitoblar, setKitoblar] = useState([
    { kitobNomi: "", muallif: "", turi: "", fanNomi: "", nashrYili: "", isbn: "" }
  ]);

  const addKitob = () => setKitoblar([...kitoblar, { kitobNomi: "", muallif: "", turi: "", fanNomi: "", nashrYili: "", isbn: "" }]);
  const removeKitob = (i) => setKitoblar(kitoblar.filter((_, idx) => idx !== i));

  const updateKitob = (index, field, value) => {
    const updated = [...kitoblar];
    updated[index][field] = value;
    setKitoblar(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topshiruvchi.topshiruvchiFIO || !topshiruvchi.lavozim || !topshiruvchi.kafedra) {
      alert("Topshiruvchi ma'lumotlari to‘ldirilishi shart!");
      return;
    }
    if (kitoblar.some(k => !k.kitobNomi || !k.muallif || !k.turi || !k.fanNomi)) {
      alert("Barcha kitoblarda nomi, muallifi, turi va fani to‘ldirilishi shart!");
      return;
    }

    setLoading(true);
    setGenerated(false);

    try {
      const yil = new Date().getFullYear();
      const counterRef = doc(db, "counters", "kitob_raqami");

      const yangiRaqamlar = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let startCount = counterDoc.exists() ? (counterDoc.data().lastNumber || 0) : 0;
        const raqamlarList = [];

        for (let i = 0; i < kitoblar.length; i++) {
          startCount += 1;
          const raqam = `${yil}-${String(startCount).padStart(3, "0")}`;
          raqamlarList.push(raqam);

          await addDoc(collection(db, "kitoblar"), {
            raqam,
            ...kitoblar[i],
            topshiruvchiFIO: topshiruvchi.topshiruvchiFIO,
            lavozim: topshiruvchi.lavozim,
            kafedra: topshiruvchi.kafedra,
            telefon: topshiruvchi.telefon,
            topshirilganVaqt: new Date(),
            userEmail: auth.currentUser?.email || "anonim",
          });
        }

        transaction.set(counterRef, { lastNumber: startCount }, { merge: true });
        return raqamlarList;
      });

      setRaqamlar(yangiRaqamlar);
      setGenerated(true);
      alert(`${yangiRaqamlar.length} ta kitob muvaffaqiyatli qabul qilindi!`);
    } catch (err) {
      console.error(err);
      alert("Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
        <h1 className="text-5xl font-bold text-center text-indigo-800 mb-12">
          JIZZAX POLITEXNIKA INSTITUTI <br /> Elektron kitob topshirish tizimi
        </h1>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* Topshiruvchi ma'lumotlari */}
          <div className="bg-yellow-50 p-8 rounded-3xl border-4 border-yellow-400">
            <h2 className="text-2xl font-bold text-yellow-900 mb-6">Topshiruvchi ma'lumotlari</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <input required placeholder="F.I.Sh (masalan: Abdullayev Umar)" value={topshiruvchi.topshiruvchiFIO}
                onChange={e => setTopshiruvchi({ ...topshiruvchi, topshiruvchiFIO: e.target.value })}
                className="px-6 py-4 border-2 border-yellow-600 rounded-xl text-lg" />

              <input required placeholder="Lavozimi (masalan: dotsent)" value={topshiruvchi.lavozim}
                onChange={e => setTopshiruvchi({ ...topshiruvchi, lavozim: e.target.value })}
                className="px-6 py-4 border-2 border-yellow-600 rounded-xl text-lg" />

              <input required placeholder="Kafedra nomi (to'liq)" value={topshiruvchi.kafedra}
                onChange={e => setTopshiruvchi({ ...topshiruvchi, kafedra: e.target.value })}
                className="px-6 py-4 border-2 border-yellow-600 rounded-xl text-lg" />
            </div>
          </div>

          {/* Kitoblar */}
          {kitoblar.map((kitob, i) => (
            <div key={i} className="bg-indigo-50 p-8 rounded-3xl border-4 border-indigo-300 relative">
              <h3 className="text-2xl font-bold text-indigo-900 mb-6">Kitob {i + 1}</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <input required placeholder="Kitob nomi" value={kitob.kitobNomi}
                  onChange={e => updateKitob(i, "kitobNomi", e.target.value)} className="px-6 py-4 border-2 rounded-xl text-lg" />

                <input required placeholder="Muallif(lar)" value={kitob.muallif}
                  onChange={e => updateKitob(i, "muallif", e.target.value)} className="px-6 py-4 border-2 rounded-xl text-lg" />

                <select required value={kitob.turi} onChange={e => updateKitob(i, "turi", e.target.value)}
                  className="px-6 py-4 border-2 rounded-xl text-lg">
                  <option value="">Kitob turini tanlang</option>
                  <option>Darslik</option>
                  <option>Uslubiy ko'rsatma</option>
                  <option>O'quv qo'llanma</option>
                  <option>Badiy adabiyot</option>
                  <option>Uslubiy qo'llanma</option>
                  <option>Lug'atlar</option>
                  <option>Ma'lumotnomalar</option>
                  <option>Ma'ruza to'plami</option>
                  <option>Boshqa adabiyotlar</option>
                  <option>O'quv uslubiy majmua</option>
                </select>

                <input required placeholder="Fan nomi" value={kitob.fanNomi}
                  onChange={e => updateKitob(i, "fanNomi", e.target.value)} className="px-6 py-4 border-2 rounded-xl text-lg" />

                <input placeholder="Nashr yili" value={kitob.nashrYili}
                  onChange={e => updateKitob(i, "nashrYili", e.target.value)} className="px-6 py-4 border-2 rounded-xl" />

                <input placeholder="ISBN" value={kitob.isbn}
                  onChange={e => updateKitob(i, "isbn", e.target.value)} className="px-6 py-4 border-2 rounded-xl" />
              </div>

              {kitoblar.length > 1 && (
                <button type="button" onClick={() => removeKitob(i)}
                  className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full">
                  <Trash2 size={24} />
                </button>
              )}
            </div>
          ))}

          <div className="flex justify-center gap-8">
            <button type="button" onClick={addKitob}
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold text-xl px-10 py-6 rounded-2xl shadow-xl">
              <Plus size={32} /> Yana kitob qo‘shish
            </button>

            <button type="submit" disabled={loading}
              className="flex items-center gap-4 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-2xl px-16 py-7 rounded-2xl shadow-2xl">
              {loading ? <Loader2 className="animate-spin" /> : "HUJJATLARNI TAYYORLASH"}
            </button>
          </div>
        </form>

        {generated && (
          <div className="mt-16 p-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-3xl border-8 border-green-600 text-center">
            <h2 className="text-4xl font-bold text-green-800 mb-6">
              {raqamlar.length} ta kitob qabul qilindi!
            </h2>
            <p className="text-2xl font-bold mb-10">Raqamlar: {raqamlar.join(" | ")}</p>
            <GeneratePDFs kitoblar={kitoblar} topshiruvchi={topshiruvchi} raqamlar={raqamlar} />
          </div>
        )}
      </div>
    </div>
  );
}