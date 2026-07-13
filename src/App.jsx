import { useState } from "react";
import { readPdf } from "./utils/pdfReader";

function App() {
  const [pdfs, setPdfs] = useState([]);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);

    const orders = [];

    for (const file of files) {
      const text = await readPdf(file);

      console.log(text);

      // رقم الطلبية
      const orderNumber =
        text.match(/07\/\d+/)?.[0] || "לא נמצא";

      // اسم الزبون
      const customerMatch = text.match(
        /מספרכם:[\s\S]*?04\s+([\u0590-\u05FFA-Za-z0-9"׳״\s]+?)\s+הזמנה/
      );

      const customer = customerMatch
        ? customerMatch[1].trim()
        : "לקוח לא נמצא";

      orders.push({
        orderNumber,
        customer,
        file: URL.createObjectURL(file),
      });
    }

    setPdfs((prev) => [...prev, ...orders]);
  };

  return (
    <div
      className="app"
      style={{
        padding: "40px",
        background: "#f5f5f5",
        minHeight: "100vh",
        textAlign: "center",
      }}
    >
      <h1>🚛 מערכת סידור משאיות</h1>

      <br />

      <input
        type="file"
        multiple
        accept="application/pdf"
        onChange={handleFiles}
      />

      <br />
      <br />

      {pdfs.map((pdf, index) => (
        <div
          key={index}
          onClick={() => window.open(pdf.file)}
          style={{
            background: "white",
            borderRadius: "15px",
            padding: "20px",
            margin: "20px auto",
            width: "500px",
            cursor: "pointer",
            boxShadow: "0 5px 15px rgba(0,0,0,.15)",
          }}
        >
          <h2>📄 {pdf.orderNumber}</h2>

          <h3>👤 {pdf.customer}</h3>

          <button
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              border: "none",
              borderRadius: "10px",
              background: "#1976d2",
              color: "white",
              cursor: "pointer",
            }}
          >
            פתח הזמנה
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;