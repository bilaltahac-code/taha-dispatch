import { useRef } from "react";
import Header from "../components/Header";
import DayTabs from "../components/DayTabs";
import Sidebar from "../components/Sidebar";
import Truck from "../components/Truck";

import { readPdf } from "../utils/pdfReader";
import { parseOrder } from "../utils/parser";
import useDispatch from "../hooks/useDispatch";

export default function Dashboard() {
  const fileInputRef = useRef();

  const {
    orders,
    setOrders,
    trucks,
    addTruck,
    addRoute,
    dropOrder,
    removeOrder,
  } = useDispatch();

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);

    const newOrders = [];

    for (const file of files) {
      const text = await readPdf(file);

      const data = parseOrder(text);

      newOrders.push({
        id: crypto.randomUUID(),
        orderNumber: data.orderNumber,
        customer: data.customer,
        pdf: URL.createObjectURL(file),
      });
    }

    setOrders((prev) => [...prev, ...newOrders]);
  };

  return (
    <div
      style={{
        direction: "rtl",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f4f6f8",
      }}
    >
      <Header />

      <DayTabs />

      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple
        accept=".pdf"
        onChange={handleFiles}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
        }}
      >
        <Sidebar
          orders={orders}
          onSelectFiles={() => fileInputRef.current.click()}
        />

        <div
          style={{
            flex: 1,
            padding: 20,
            overflow: "auto",
          }}
        >
          {trucks.map((truck) => (
            <Truck
              key={truck.id}
              truck={truck}
              onAddRoute={addRoute}
              onDropOrder={dropOrder}
              onRemoveOrder={removeOrder}
            />
          ))}

          <button
            onClick={addTruck}
            style={{
              width: "100%",
              padding: 18,
              border: "2px dashed #1976d2",
              borderRadius: 12,
              background: "white",
              color: "#1976d2",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            ➕ הוסף משאית נוספת
          </button>
        </div>
      </div>
    </div>
  );
}