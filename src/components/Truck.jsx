import "./Truck.css";
import Route from "./Route";

export default function Truck({
  truck,
  onAddRoute,
  onDropOrder,
  onRemoveOrder,
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
      }}
    >
      <h2
        style={{
          margin: 0,
          marginBottom: 20,
        }}
      >
        🚚 {truck.name}
      </h2>

      {truck.routes.map((route) => (
        <Route
          key={route.id}
          route={route}
          onDropOrder={(orderId, routeId) =>
            onDropOrder(orderId, truck.id, routeId)
          }
          onRemoveOrder={(orderId) =>
            onRemoveOrder(orderId, truck.id, route.id)
          }
        />
      ))}

      <button
        onClick={() => onAddRoute(truck.id)}
        style={{
          width: "100%",
          padding: 12,
          background: "#1976d2",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: 15,
        }}
      >
        ➕ הוסף מסלול
      </button>
    </div>
  );
}