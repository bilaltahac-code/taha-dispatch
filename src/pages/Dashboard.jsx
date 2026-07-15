import { useRef, useState } from "react";

import Header from "../components/Header";
import DayTabs from "../components/DayTabs";
import Sidebar from "../components/Sidebar";
import Truck from "../components/Truck";
import CompletedOrders from "./CompletedOrders";

import { readPdf } from "../utils/pdfReader";
import { parseOrder } from "../utils/parser";
import useDispatch from "../hooks/useDispatch";

const createTodayKey = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function Dashboard() {
  const fileInputRef = useRef();

  const [selectedDate, setSelectedDate] = useState(createTodayKey);
  const [currentPage, setCurrentPage] = useState("dispatch");

  const {
    orders,
    setOrders,
    trucks,
    completedOrders,
    addTruck,
    addRoute,
    deleteRoute,
    moveRoute,
    dropOrder,
    removeOrder,
    completeOrder,
  } = useDispatch(selectedDate);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    const newOrders = [];

    for (const file of files) {
      try {
        const text = await readPdf(file);
        const data = parseOrder(text);

        newOrders.push({
          id: crypto.randomUUID(),
          orderNumber: data.orderNumber,
          customer: data.customer,
          pdf: URL.createObjectURL(file),
        });
      } catch (error) {
        console.error("Failed to read PDF:", error);
      }
    }

    if (newOrders.length > 0) {
      setOrders((prev) => [...prev, ...newOrders]);
    }

    event.target.value = "";
  };

  if (currentPage === "completed") {
    return (
      <CompletedOrders
        completedOrders={completedOrders}
        onBack={() => setCurrentPage("dispatch")}
      />
    );
  }

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

      <DayTabs
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple
        accept=".pdf,application/pdf"
        onChange={handleFiles}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          minHeight: 0,
        }}
      >
        <Sidebar
          orders={orders}
          onSelectFiles={() => fileInputRef.current?.click()}
        />

        <div
          style={{
            flex: 1,
            padding: 20,
            overflow: "auto",
          }}
        >
          <button
            type="button"
            onClick={() => setCurrentPage("completed")}
            style={{
              width: "100%",
              padding: 13,
              marginBottom: 20,
              border: "none",
              borderRadius: 10,
              background: "#43a047",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            ✅ הזמנות שהושלמו ({completedOrders.length})
          </button>

          {trucks.map((truck) => (
            <Truck
              key={truck.id}
              truck={truck}
              onAddRoute={addRoute}
              onDeleteRoute={deleteRoute}
              onMoveRoute={moveRoute}
              onDropOrder={dropOrder}
              onRemoveOrder={removeOrder}
              onCompleteOrder={completeOrder}
            />
          ))}

          <button
            type="button"
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