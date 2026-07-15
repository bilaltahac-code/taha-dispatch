import "./Truck.css";
import Route from "./Route";

export default function Truck({
  truck,
  onAddRoute,
  onDeleteRoute,
  onMoveRoute,
  onDropOrder,
  onRemoveOrder,
  onCompleteOrder,
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

      {truck.routes.map((route, index) => (
        <Route
          key={route.id}
          route={route}
          truckId={truck.id}
          canDelete={index !== 0}
          canMoveUp={index > 0}
          canMoveDown={index < truck.routes.length - 1}
          onMoveUp={() =>
            onMoveRoute(truck.id, route.id, "up")
          }
          onMoveDown={() =>
            onMoveRoute(truck.id, route.id, "down")
          }
          onDeleteRoute={() =>
            onDeleteRoute(truck.id, route.id)
          }
          onDropOrder={(
            orderId,
            routeId,
            sourceTruckId,
            sourceRouteId
          ) =>
            onDropOrder(
              orderId,
              truck.id,
              routeId,
              sourceTruckId,
              sourceRouteId
            )
          }
          onRemoveOrder={(orderId) =>
            onRemoveOrder(orderId, truck.id, route.id)
          }
          onCompleteOrder={(orderId) =>
            onCompleteOrder(orderId, truck.id, route.id)
          }
        />
      ))}

      <button
        type="button"
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