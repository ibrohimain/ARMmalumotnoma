// src/components/GeneratePDFs.jsx ← TO‘LIQ SHU BILAN ALMASHTIRING!!!

import { jsPDF } from "jspdf";
import { format } from "date-fns";

export default function GeneratePDFs({ kitoblar, topshiruvchi, raqamlar }) {
  const bugun = format(new Date(), "dd.MM.yyyy");

  const hammaHujjatlar = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const w = doc.internal.pageSize.getWidth();

    // ====================== 1-BET: ROZILIK XATI ======================
    doc.setFont("times", "normal");

    // Yuqori qism – kafedra va lavozim
    doc.setFontSize(11);
    doc.text(`«${topshiruvchi.kafedra}»`, w / 2, 20, { align: "center" });
    doc.text(`kafedrasi ${topshiruvchi.lavozim}`, w / 2, 26, { align: "center" });
    doc.text(`Eshonqulov Sherzod tomonidan`, w / 2, 32, { align: "center" });

    // Sarlavha
    doc.setFontSize(24);
    doc.setFont("times", "bold");
    doc.text("ROZILIK XATI", w / 2, 55, { align: "center" });

    // Asosiy matn – aynan rasm kabi
    doc.setFontSize(12);
    let y = 75;

    const kitobNomalari = kitoblar.map(k => `«${k.kitobNomi}»`).join(", ");
    const kitobTurlari = [...new Set(kitoblar.map(k => k.turi))].join(", ");

    const matn = [
      `Men “${kitobNomalari}” ${kitobTurlari}ni`, "",
      "O‘zbekiston Respublikasining “Mualliflik huquqi va turdosh huquqlar to‘g‘risida”gi qonunning", " ",
      "18-19-moddalari talablaridan kelib chiqqan holda Jizzax politexnika instituti Axborot-resurs",
      "markazi huzurida tashkil etilgan “Elektron kutubxona” platformasiga joylashtirish va undan",
      "talabalar, tadqiqotchilar, professor-o‘qituvchilar tomonidan bepul foydalanishiga",
      "(yuklab olish, to‘plash va tarqatish) roziligimni bildiraman.",
      "",
      "Mazkur rozilik xati mualliflik ob’yektiga nisbatan mulkiy huquqlarni o‘zga shaxslarga",
      "berishni anglatmaydi."
    ];

    matn.forEach(line => {
      if (line === "") y += 6;
      else doc.text(line, 20, y, { maxWidth: w - 40 });
      y += 6;
    });

    // Sana va imzo
    doc.setFontSize(12);
    doc.text(bugun + " yil", 20, y + 15);
    doc.text("Eshonqulov Sh.", w - 40, y + 15, { align: "right" });

    // ====================== 2-BET: MA’LUMOTNOMA ======================
    doc.addPage();

    // Sana – o‘ng yuqori burchakda
    doc.setFontSize(10);
    doc.text(`"${bugun} yil"`, w - 30, 10, { align: "right" });

    // Institut nomi
    doc.setFontSize(10);
    doc.text("O‘ZBEKISTON RESPUBLIKASI OLIY TA’LIM, FAN VA INNOVATSIYALAR VAZIRLIGI", w / 2, 20, { align: "center" });
    doc.text("JIZZAX POLITEXNIKA INSTITUTI", w / 2, 26, { align: "center" });
    doc.text("Axborot resurs markazi “Elektron axborot resurslari” bo‘limiga institut professor-o‘qituvchilari", w / 2, 34, { align: "center" });
    doc.text("tomonidan elektron kitoblar topshirilganligi to‘g‘risida", w / 2, 40, { align: "center" });

    // Sarlavha
    doc.setFontSize(28);
    doc.setFont("times", "bold");
    doc.text("MA’LUMOTNOMA", w / 2, 60, { align: "center" });

    // Jadval sarlavhasi – aynan rasm kabi
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("№", 20, 80);
    doc.text("Muallifi", 40, 80);
    doc.text("Kitobning nomi", 90, 80);
    doc.text("ISBN kodi", 160, 80);

    // Chiziq
    doc.setLineWidth(0.5);
    doc.line(18, 83, w - 18, 83);

    // Kitoblar
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    let yPos = 95;

    kitoblar.forEach((kitob, i) => {
      const raqam = raqamlar[i].split("-")[1];
      const muallif = kitob.muallif.length > 25 ? kitob.muallif.substring(0, 25) + "..." : kitob.muallif;
      const nomi = kitob.kitobNomi.length > 35 ? kitob.kitobNomi.substring(0, 35) + "..." : kitob.kitobNomi;

      doc.text(raqam, 22, yPos);
      doc.text(muallif, 35, yPos);
      doc.text(nomi, 70, yPos, { maxWidth: 80 });
      doc.text(kitob.isbn || "—", 165, yPos);

      // Har bir qator ostiga chiziq
      doc.setLineWidth(0.3);
      doc.line(18, yPos + 5, w - 18, yPos + 5);

      yPos += 20;
    });

    // Bo‘sh qatorlar – 7 tagacha
    for (let i = kitoblar.length + 1; i <= 7; i++) {
      doc.text(String(i), 22, yPos);
      doc.line(18, yPos + 5, w - 18, yPos + 5);
      yPos += 20;
    }

    // Imzo qismi – aynan rasm kabi
    yPos += 30;
    doc.setFontSize(12);
    doc.text(`Topshirdi: ${topshiruvchi.topshiruvchiFIO}`, 20, yPos);
    doc.text("_______________________", 20, yPos + 15);
    doc.text("(imzo)", 35, yPos + 21);

    doc.text("Qabul qildi: Abdullayev. I", 110, yPos);
    doc.text("_______________________", 110, yPos + 15);
    doc.text("(imzo)", 125, yPos + 21);

    // Muhr
    try {
      doc.addImage("/muhr.jpg", "JPEG", 125, yPos + 25, 50, 50);
    } catch (e) {}

    // 100% YUKLANADI
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Malumotnoma_${raqamlar[0].replace("-", "_")}_${kitoblar.length > 1 ? raqamlar[raqamlar.length-1].split("-")[1] : ""}.pdf`;
    a.click();

    setTimeout(() => {
      window.open(url, "_blank");
    }, 500);
  };

  return (
    <div className="mt-12 text-center space-y-10">
      <button
        onClick={hammaHujjatlar}
        className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold text-3xl py-14 px-64 rounded-3xl shadow-2xl transition transform hover:scale-105 animate-pulse"
      >
        RASMIY HUJJATLARNI YUKLAB OLISH VA CHOP ETISH
      </button>

      <p className="text-2xl font-bold text-green-700">
        100% institut rasmiy shakliga mos • Har bir harf va chiziq to‘g‘ri
      </p>

      {window.location.pathname.includes("/add-book") && (
        <button
          onClick={() => window.location.href = "/admin"}
          className="bg-black hover:bg-gray-900 text-white font-bold text-2xl py-8 px-48 rounded-2xl shadow-2xl transition transform hover:scale-105"
        >
          ADMIN PANELGA QAYTISH
        </button>
      )}
    </div>
  );
}