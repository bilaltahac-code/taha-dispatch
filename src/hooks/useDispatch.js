import { useState } from "react";

export default function useDispatch() {
  const [orders, setOrders] = useState([]);

  const [trucks, setTrucks] = useState([
    {
      id: "az",
      name: "עז",
      routes: [
        {
          id: "az-route-1",
          name: "מסלול 1",
          orders: [],
        },
      ],
    },
    {
      id: "zbidat",
      name: "זבידאת",
      routes: [
        {
          id: "zb-route-1",
          name: "מסלול 1",
          orders: [],
        },
      ],
    },
  ]);

  const addTruck = () => {
    setTrucks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `משאית ${prev.length + 1}`,
        routes: [
          {
            id: crypto.randomUUID(),
            name: "מסלול 1",
            orders: [],
          },
        ],
      },
    ]);
  };

  const addRoute = (truckId) => {
    setTrucks((prev) =>
      prev.map((truck) => {
        if (truck.id !== truckId) return truck;

        return {
          ...truck,
          routes: [
            ...truck.routes,
            {
              id: crypto.randomUUID(),
              name: `מסלול ${truck.routes.length + 1}`,
              orders: [],
            },
          ],
        };
      })
    );
  };

  const dropOrder = (orderId, truckId, routeId) => {
    const order = orders.find((o) => o.id === orderId);

    if (!order) return;

    setOrders((prev) => prev.filter((o) => o.id !== orderId));

    setTrucks((prev) =>
      prev.map((truck) => {
        if (truck.id !== truckId) return truck;

        return {
          ...truck,
          routes: truck.routes.map((route) => {
            if (route.id !== routeId) return route;

            return {
              ...route,
              orders: [...route.orders, order],
            };
          }),
        };
      })
    );
  };

  const removeOrder = (orderId, truckId, routeId) => {
    let orderToReturn = null;

    setTrucks((prev) =>
      prev.map((truck) => {
        if (truck.id !== truckId) return truck;

        return {
          ...truck,
          routes: truck.routes.map((route) => {
            if (route.id !== routeId) return route;

            orderToReturn = route.orders.find(
              (o) => o.id === orderId
            );

            return {
              ...route,
              orders: route.orders.filter(
                (o) => o.id !== orderId
              ),
            };
          }),
        };
      })
    );

    if (orderToReturn) {
      setTimeout(() => {
        setOrders((prev) => [...prev, orderToReturn]);
      }, 0);
    }
  };

  return {
    orders,
    setOrders,
    trucks,
    addTruck,
    addRoute,
    dropOrder,
    removeOrder,
  };
}