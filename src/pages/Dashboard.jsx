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
import { supabase } from "../lib/supabase";

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

const createCloudPdfPath = (fileName, orderNumber) => {
  const safeFileName = createSafePdfName(fileName, orderNumber);

  return `orders/${safeFileName}`;
};

const uploadPdfToCloud = async (file, orderNumber) => {
  const cloudPath = createCloudPdfPath(file.name, orderNumber);

  const { error: uploadError } = await supabase.storage
    .from("pdfs")
    .upload(cloudPath, file, {
      cacheControl: "3600",
      contentType: file.type || "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from("pdfs")
    .getPublicUrl(cloudPath);

  if (!data?.publicUrl) {
    throw new Error("Supabase did not return a public PDF URL");
  }

  return {
    cloudPath,
    publicUrl: data.publicUrl,
  };
};

const formatEditorTime = (metadata) => {
  const rawTime =
    metadata?.updatedAt ||
    metadata?.lastModifiedAt ||
    metadata?.modifiedAt ||
    metadata?.timestamp;

  if (!rawTime) {
    return "";
  }

  const date = new Date(rawTime);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const getEditorName = (metadata) =>
  metadata?.userName ||
  metadata?.editorName ||
  metadata?.name ||
  metadata?.user ||
  "משתמש לא ידוע";

const getDeviceName = (metadata) =>
  metadata?.deviceName ||
  metadata?.device ||
  metadata?.computerName ||
  metadata?.deviceId ||
  "";

const getSyncDisplay = (syncStatus) => {
  switch (syncStatus) {
    case "synced":
      return {
        icon: "🟢",
        label: "מסונכרן",
        background: "rgba(24, 134, 75, 0.1)",
        border: "rgba(24, 134, 75, 0.28)",
        color: "#157347",
      };

    case "syncing":
    case "connecting":
      return {
        icon: "🟡",
        label: syncStatus === "connecting" ? "מתחבר..." : "מסנכרן...",
        background: "rgba(245, 158, 11, 0.11)",
        border: "rgba(245, 158, 11, 0.3)",
        color: "#9a6700",
      };

    case "offline":
      return {
        icon: "🔴",
        label: "לא מחובר — השינויים נשמרים מקומית",
        background: "rgba(220, 38, 38, 0.08)",
        border: "rgba(220, 38, 38, 0.24)",
        color: "#b42318",
      };

    case "conflict":
      return {
        icon: "⚠️",
        label: "קיימת התנגשות בין מכשירים",
        background: "rgba(234, 88, 12, 0.1)",
        border: "rgba(234, 88, 12, 0.3)",
        color: "#b54708",
      };

    case "error":
      return {
        icon: "❌",
        label: "שגיאת סנכרון",
        background: "rgba(220, 38, 38, 0.08)",
        border: "rgba(220, 38, 38, 0.24)",
        color: "#b42318",
      };

    default:
      return {
        icon: "⚪",
        label: "בודק חיבור...",
        background: "rgba(100, 116, 139, 0.08)",
        border: "rgba(100, 116, 139, 0.22)",
        color: "#475569",
      };
  }
};

export default function Dashboard() {
  const fileInputRef = useRef();

  const [selectedDate, setSelectedDate] = useState(createTodayKey);
  const [currentPage, setCurrentPage] = useState("dispatch");
  const [pendingOrders, setPendingOrders] = useState([]);
  const [destinationInput, setDestinationInput] = useState("");
  const [isResolvingConflict, setIsResolvingConflict] = useState(false);
  const [isBackupBusy, setIsBackupBusy] = useState(false);

  const {
    orders,
    setOrders,
    syncStatus,
    syncConflict,
    lastEditor,
    dispatchEditor,
    updateDispatchEditor,
    resolveConflictWithLocal,
    resolveConflictWithCloud,
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
    exportBackup,
    importBackup,
  } = useDispatch(selectedDate);

  const currentPendingOrder = pendingOrders[0] || null;
  const syncDisplay = getSyncDisplay(syncStatus);

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
        const text = await readPdf(file);
        const data = parseOrder(text);

        const cloudResult = await uploadPdfToCloud(
          file,
          data.orderNumber
        );

        let localPdfPath = "";

        if (window.electronAPI?.savePdf) {
          try {
            const fileBuffer = await file.arrayBuffer();

            const savedFileName = createSafePdfName(
              file.name,
              data.orderNumber
            );

            const saveResult = await window.electronAPI.savePdf(
              fileBuffer,
              savedFileName
            );

            if (saveResult?.success && saveResult.filePath) {
              localPdfPath = saveResult.filePath;
            }
          } catch (localSaveError) {
            console.warn(
              "PDF uploaded to Supabase but local save failed:",
              localSaveError
            );
          }
        }

        parsedOrders.push({
          id: crypto.randomUUID(),
          orderNumber: data.orderNumber,
          customer: data.customer,
          destination: "",
          pdf: cloudResult.publicUrl,
          pdfUrl: cloudResult.publicUrl,
          pdfStoragePath: cloudResult.cloudPath,
          localPdfPath,
        });
      } catch (error) {
        console.error("Failed to read or upload PDF:", error);

        window.alert(
          `לא ניתן לקרוא או להעלות את הקובץ: ${file.name}`
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

  const handleKeepLocalChanges = async () => {
    if (isResolvingConflict) {
      return;
    }

    setIsResolvingConflict(true);

    try {
      await resolveConflictWithLocal();
    } finally {
      setIsResolvingConflict(false);
    }
  };

  const handleUseCloudChanges = () => {
    if (isResolvingConflict) {
      return;
    }

    resolveConflictWithCloud();
  };

  const handleEditorNameChange = () => {
    const currentName =
      dispatchEditor?.userName ||
      dispatchEditor?.editorName ||
      dispatchEditor?.name ||
      "";

    const nextName = window.prompt(
      "הזן את שם המשתמש או העובד במכשיר הזה:",
      currentName
    );

    if (nextName === null) {
      return;
    }

    const cleanName = nextName.trim();

    if (!cleanName) {
      return;
    }

    updateDispatchEditor({
      userName: cleanName,
      editorName: cleanName,
      name: cleanName,
    });
  };

  const handleExportBackup = async () => {
    if (isBackupBusy) {
      return;
    }

    setIsBackupBusy(true);

    try {
      const result = await exportBackup();

      if (result?.success) {
        window.alert("הגיבוי נשמר בהצלחה.");
      } else if (result?.canceled) {
        return;
      } else {
        window.alert(
          result?.error || "לא ניתן לשמור את הגיבוי."
        );
      }
    } catch (error) {
      console.error("Failed to export backup:", error);
      window.alert("לא ניתן לשמור את הגיבוי.");
    } finally {
      setIsBackupBusy(false);
    }
  };

  const handleImportBackup = async () => {
    if (isBackupBusy) {
      return;
    }

    const confirmed = window.confirm(
      "שחזור גיבוי יחליף את כל הנתונים הקיימים. להמשיך?"
    );

    if (!confirmed) {
      return;
    }

    setIsBackupBusy(true);

    try {
      const result = await importBackup();

      if (result?.success) {
        if (result.warning) {
          window.alert(
            "הגיבוי שוחזר במכשיר, אך הסנכרון לענן נכשל."
          );
        } else {
          window.alert("הגיבוי שוחזר בהצלחה.");
        }
      } else if (result?.canceled) {
        return;
      } else {
        window.alert(
          result?.error || "לא ניתן לשחזר את הגיבוי."
        );
      }
    } catch (error) {
      console.error("Failed to import backup:", error);
      window.alert("לא ניתן לשחזר את הגיבוי.");
    } finally {
      setIsBackupBusy(false);
    }
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
                  onClick={handleExportBackup}
                  disabled={isBackupBusy}
                  style={{
                    minHeight: 40,
                    padding: "8px 14px",
                    borderRadius: "var(--radius-small)",
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    fontWeight: 700,
                    fontSize: 14,
                    opacity: isBackupBusy ? 0.65 : 1,
                    cursor: isBackupBusy ? "wait" : "pointer",
                  }}
                >
                  💾 גיבוי
                </button>

                <button
                  type="button"
                  onClick={handleImportBackup}
                  disabled={isBackupBusy}
                  style={{
                    minHeight: 40,
                    padding: "8px 14px",
                    borderRadius: "var(--radius-small)",
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    fontWeight: 700,
                    fontSize: 14,
                    opacity: isBackupBusy ? 0.65 : 1,
                    cursor: isBackupBusy ? "wait" : "pointer",
                  }}
                >
                  📂 שחזור
                </button>

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

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={handleEditorNameChange}
                  title="שינוי שם המשתמש במכשיר הזה"
                  style={{
                    minHeight: 38,
                    padding: "7px 12px",
                    borderRadius: "var(--radius-small)",
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  👤{" "}
                  {getEditorName(dispatchEditor)}
                </button>

                <div
                  style={{
                    minHeight: 38,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "7px 12px",
                    borderRadius: "var(--radius-small)",
                    border: `1px solid ${syncDisplay.border}`,
                    background: syncDisplay.background,
                    color: syncDisplay.color,
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  <span>{syncDisplay.icon}</span>
                  <span>{syncDisplay.label}</span>
                </div>
              </div>
            </div>

            {lastEditor && (
              <div
                style={{
                  marginBottom: 14,
                  padding: "9px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-small)",
                  background: "rgba(255, 255, 255, 0.64)",
                  color: "var(--text-secondary)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                עדכון אחרון:{" "}
                <strong style={{ color: "var(--text)" }}>
                  {getEditorName(lastEditor)}
                </strong>
                {getDeviceName(lastEditor)
                  ? ` — ${getDeviceName(lastEditor)}`
                  : ""}
                {formatEditorTime(lastEditor)
                  ? ` — ${formatEditorTime(lastEditor)}`
                  : ""}
              </div>
            )}

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

      {syncConflict && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="התנגשות סנכרון"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
            background: "rgba(15, 23, 42, 0.58)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              width: "min(560px, 100%)",
              padding: 22,
              borderRadius: 18,
              border: "1px solid rgba(234, 88, 12, 0.28)",
              background: "var(--surface)",
              boxShadow: "0 24px 60px rgba(15, 23, 42, 0.24)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 28 }}>⚠️</span>

              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "var(--text)",
                    fontSize: 20,
                  }}
                >
                  התנגשות בין שני מכשירים
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "var(--text-secondary)",
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                >
                  מכשיר אחר שמר שינויים בזמן שגם במכשיר הזה
                  בוצעו שינויים. בחר איזו גרסה לשמור.
                </p>
              </div>
            </div>

            {syncConflict.remoteMetadata && (
              <div
                style={{
                  margin: "14px 0",
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                  color: "var(--text-secondary)",
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
                הגרסה בענן נשמרה על ידי{" "}
                <strong style={{ color: "var(--text)" }}>
                  {getEditorName(syncConflict.remoteMetadata)}
                </strong>
                {getDeviceName(syncConflict.remoteMetadata)
                  ? ` — ${getDeviceName(
                      syncConflict.remoteMetadata
                    )}`
                  : ""}
                {formatEditorTime(syncConflict.remoteMetadata)
                  ? ` — ${formatEditorTime(
                      syncConflict.remoteMetadata
                    )}`
                  : ""}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 10,
                marginTop: 18,
              }}
            >
              <button
                type="button"
                onClick={handleKeepLocalChanges}
                disabled={isResolvingConflict}
                style={{
                  minHeight: 46,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "var(--primary)",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: 14,
                  opacity: isResolvingConflict ? 0.65 : 1,
                  cursor: isResolvingConflict
                    ? "wait"
                    : "pointer",
                }}
              >
                {isResolvingConflict
                  ? "שומר..."
                  : "שמור את השינויים מהמכשיר הזה"}
              </button>

              <button
                type="button"
                onClick={handleUseCloudChanges}
                disabled={isResolvingConflict}
                style={{
                  minHeight: 46,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text)",
                  fontWeight: 800,
                  fontSize: 14,
                  opacity: isResolvingConflict ? 0.65 : 1,
                  cursor: isResolvingConflict
                    ? "wait"
                    : "pointer",
                }}
              >
                השתמש בגרסה מהמכשיר האחר
              </button>
            </div>

            <p
              style={{
                margin: "12px 0 0",
                color: "var(--text-secondary)",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              חשוב: בחירה באחת הגרסאות תחליף את הגרסה השנייה.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}