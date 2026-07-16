import { useRef, useState } from "react";

import Header from "../components/Header";
import DayTabs from "../components/DayTabs";
import Sidebar from "../components/Sidebar";
import Truck from "../components/Truck";
import DestinationModal from "../components/DestinationModal";
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
  const [pendingOrders, setPendingOrders] = useState([]);
  const [destinationInput, setDestinationInput] = useState("");

  const {
    orders,
    setOrders,
    trucks,
    completedOrders,
    restoreCompletedOrder,
    deleteOrder,
    updateOrder,
    renameTruck,
    updateRouteNote,
    addTruck,
    addRoute,
    deleteRoute,
    moveRoute,
    dropOrder,
    removeOrder,
    toggleOrderDispatched,
    finishDay,
  } = useDispatch(selectedDate);

  const currentPendingOrder = pendingOrders[0] || null;

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    const parsedOrders = [];

    for (const file of files) {
      try {
        const text = await readPdf(file);
        const data = parseOrder(text);

        parsedOrders.push({
          id: crypto.randomUUID(),
          orderNumber: data.orderNumber,
          customer: data.customer,
          destination: "",
          pdf: URL.createObjectURL(file),
        });
      } catch (error) {
        console.error("Failed to read PDF:", error);
        window.alert(`לא ניתן לקרוא את הקובץ: ${file.name}`);
      }
    }

    if (parsedOrders.length > 0) {
      setPendingOrders((prev) => [
        ...prev,
        ...parsedOrders,
      ]);
    }

    event.target.value = "";
  };

  const confirmPendingOrder = () => {
    if (!currentPendingOrder) {
      return;
    }

    const completedOrder = {
      ...currentPendingOrder,
      destination: destinationInput.trim(),
    };

    setOrders((prev) => [...prev, completedOrder]);
    setPendingOrders((prev) => prev.slice(1));
    setDestinationInput("");
  };

  const handleFinishDay = () => {
    const dispatchedCount = trucks.reduce(
      (total, truck) =>
        total +
        truck.routes.reduce(
          (routeTotal, route) =>
            routeTotal +
            route.orders.filter(
              (order) => Boolean(order.dispatched)
            ).length,
          0
        ),
      0
    );

    if (dispatchedCount === 0) {
      window.alert("אין הזמנות שסומנו כיצאו");
      return;
    }

    const confirmed = window.confirm(
      `לסיים את היום ולהעביר ${dispatchedCount} הזמנות להיסטוריה?`
    );

    if (!confirmed) {
      return;
    }

    finishDay();
  };

  const handleRestoreOrder = (orderId) => {
    restoreCompletedOrder(orderId);
    setCurrentPage("dispatch");
  };

  if (currentPage === "completed") {
    return (
      <CompletedOrders
        completedOrders={completedOrders}
        onBack={() => setCurrentPage("dispatch")}
        onRestoreOrder={handleRestoreOrder}
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
          onDeleteOrder={deleteOrder}
          onUpdateOrder={updateOrder}
        />

        <div
          style={{
            flex: 1,
            padding: 20,
            overflow: "auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <button
              type="button"
              onClick={() => setCurrentPage("completed")}
              style={{
                padding: 13,
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

            <button
              type="button"
              onClick={handleFinishDay}
              style={{
                padding: 13,
                border: "none",
                borderRadius: 10,
                background: "#263238",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              🌙 סיים יום עבודה
            </button>
          </div>

          {trucks.map((truck) => (
            <Truck
              key={truck.id}
              truck={truck}
              onAddRoute={addRoute}
              onDeleteRoute={deleteRoute}
              onMoveRoute={moveRoute}
              onDropOrder={dropOrder}
              onRemoveOrder={removeOrder}
              onToggleDispatched={toggleOrderDispatched}
              onRenameTruck={renameTruck}
              onUpdateRouteNote={updateRouteNote}
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

      <DestinationModal
        order={currentPendingOrder}
        destination={destinationInput}
        pendingCount={pendingOrders.length}
        onDestinationChange={setDestinationInput}
        onConfirm={confirmPendingOrder}
      />
    </div>
  );
}