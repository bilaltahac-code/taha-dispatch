import { useEffect, useRef, useState } from "react";

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

const createSafePdfName = (fileName, orderNumber) => {
  const cleanOrderNumber = String(orderNumber || "order")
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim();

  const cleanOriginalName = String(fileName || "order.pdf")
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim();

  const timestamp = Date.now();

  return `${cleanOrderNumber}-${timestamp}-${cleanOriginalName}`;
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
    deleteTruck,
    addRoute,
    deleteRoute,
    moveRoute,
    dropOrder,
    removeOrder,
    toggleOrderDispatched,
  } = useDispatch(selectedDate);

  const currentPendingOrder = pendingOrders[0] || null;

  useEffect(() => {
    let midnightTimeout;

    const moveToToday = () => {
      setSelectedDate(createTodayKey());
    };

    const scheduleNextMidnight = () => {
      const now = new Date();

      const nextMidnight = new Date(now);
      nextMidnight.setDate(nextMidnight.getDate() + 1);
      nextMidnight.setHours(0, 0, 1, 0);

      const delay = nextMidnight.getTime() - now.getTime();

      midnightTimeout = window.setTimeout(() => {
        moveToToday();
        scheduleNextMidnight();
      }, delay);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        moveToToday();
      }
    };

    scheduleNextMidnight();

    window.addEventListener("focus", moveToToday);

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.clearTimeout(midnightTimeout);

      window.removeEventListener("focus", moveToToday);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    const parsedOrders = [];

    for (const file of files) {
      try {
        if (!window.electronAPI?.savePdf) {
          throw new Error("Electron API is not available");
        }

        const text = await readPdf(file);
        const data = parseOrder(text);

        const fileBuffer = await file.arrayBuffer();

        const savedFileName = createSafePdfName(
          file.name,
          data.orderNumber
        );

        const saveResult = await window.electronAPI.savePdf(
          fileBuffer,
          savedFileName
        );

        if (!saveResult?.success || !saveResult.filePath) {
          throw new Error(
            saveResult?.error || "Failed to save PDF"
          );
        }

        parsedOrders.push({
          id: crypto.randomUUID(),
          orderNumber: data.orderNumber,
          customer: data.customer,
          destination: "",
          pdf: saveResult.filePath,
        });
      } catch (error) {
        console.error("Failed to read or save PDF:", error);

        window.alert(
          `לא ניתן לקרוא או לשמור את הקובץ: ${file.name}`
        );
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
        overflow: "hidden",
        background: "var(--background)",
      }}
    >
      <Header />

      <div
        style={{
          padding: "10px 18px 0",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "var(--shadow-small)",
          zIndex: 5,
        }}
      >
        <DayTabs
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>

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
          overflow: "hidden",
        }}
      >
        <Sidebar
          orders={orders}
          onSelectFiles={() => fileInputRef.current?.click()}
          onDeleteOrder={deleteOrder}
          onUpdateOrder={updateOrder}
        />

        <main
          style={{
            flex: 1,
            minWidth: 0,
            padding: 16,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1500,
              margin: "0 auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 14,
                padding: "10px 12px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-medium)",
                boxShadow: "var(--shadow-small)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => setCurrentPage("completed")}
                  style={{
                    minHeight: 40,
                    padding: "8px 18px",
                    borderRadius: "var(--radius-small)",
                    background: "var(--success)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 14,
                    boxShadow:
                      "0 4px 10px rgba(24, 134, 75, 0.18)",
                  }}
                >
                  ✅ הזמנות שהושלמו ({completedOrders.length})
                </button>
              </div>
            </div>

            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(420px, 1fr))",
                alignItems: "start",
                gap: 16,
                marginBottom: 16,
              }}
            >
              {trucks.map((truck) => (
                <Truck
                  key={truck.id}
                  truck={truck}
                  canDelete={
                    truck.id !== "az" &&
                    truck.id !== "zbidat"
                  }
                  onDeleteTruck={deleteTruck}
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
            </section>

            <button
              type="button"
              onClick={addTruck}
              style={{
                width: "100%",
                minHeight: 52,
                padding: "12px 18px",
                border: "2px dashed var(--primary)",
                borderRadius: "var(--radius-medium)",
                background: "rgba(255, 255, 255, 0.72)",
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              ＋ הוסף משאית נוספת
            </button>
          </div>
        </main>
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