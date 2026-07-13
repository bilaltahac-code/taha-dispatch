import { useState, useEffect } from "react";
import { readPdf } from "./utils/pdfReader";
import { parseOrder } from "./utils/parser";

function App() {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("orders");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const handleFiles = async (e) => {
  const files = Array.from(e.target.files);
  const result = [];

  for (const file of files) {
    const text = await readPdf(file);

    const data = parseOrder(text);

    // حفظ الملف داخل Documents/Taha Dispatch
    const buffer = await file.arrayBuffer();

    const savedPath = await window.electronAPI.savePdf(
      Array.from(new Uint8Array(buffer)),
      file.name
    );

    result.push({
      customer: data.customer,
      orderNumber: data.orderNumber,
      pdf: savedPath,
    });
  }

  setOrders((prev) => [...prev, ...result]);
};

  const deleteOrder = (index) => {
    const newOrders = orders.filter((_, i) => i !== index);
    setOrders(newOrders);
  };

  return (
    <div
      style={{
        background: "#f5f5f5",
        minHeight: "100vh",
        padding: "30px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ textAlign: "center" }}>
        🚛 מערכת סידור משאיות
      </h1>

      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFiles}
        />
      </div>

      {orders.map((order, index) => (
        <div
          key={index}
          style={{
            background: "white",
            borderRadius: 15,
            padding: 20,
            marginBottom: 20,
            boxShadow: "0 2px 10px rgba(0,0,0,.15)",
          }}
        >
          <h2>📄 {order.orderNumber}</h2>

          <h3>👤 {order.customer}</h3>

          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            <button
              onClick={() => window.electronAPI.openPdf(order.pdf)}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              פתח הזמנה
            </button>

            <button
              onClick={() => deleteOrder(index)}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: 8,
                background: "#d32f2f",
                color: "white",
                cursor: "pointer",
              }}
            >
              מחק
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;