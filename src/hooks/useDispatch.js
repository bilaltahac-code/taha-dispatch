import { useEffect, useState } from "react";

import {
  addRouteToTruck,
  deleteRouteFromTruck,
  moveRouteInTruck,
} from "./useRoutes";

const STORAGE_KEY = "taha-dispatch-data-v1";

const createDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createDefaultTrucks = () => [
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
];

const normalizeTrucks = (trucks) => {
  if (!Array.isArray(trucks) || trucks.length === 0) {
    return createDefaultTrucks();
  }

  return trucks.map((truck) => ({
    ...truck,
    routes:
      Array.isArray(truck.routes) && truck.routes.length > 0
        ? truck.routes.map((route) => ({
            ...route,
            orders: Array.isArray(route.orders)
              ? route.orders
              : [],
          }))
        : [
            {
              id: crypto.randomUUID(),
              name: "מסלול 1",
              orders: [],
            },
          ],
  }));
};

const loadSavedData = (initialDate) => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
      return {
        orders: [],
        completedOrders: [],
        plans: {
          [initialDate]: {
            trucks: createDefaultTrucks(),
          },
        },
      };
    }

    const parsedData = JSON.parse(savedData);

    if (
      parsedData.plans &&
      typeof parsedData.plans === "object"
    ) {
      const normalizedPlans = {};

      Object.entries(parsedData.plans).forEach(
        ([dateKey, plan]) => {
          normalizedPlans[dateKey] = {
            trucks: normalizeTrucks(plan?.trucks),
          };
        }
      );

      return {
        orders: Array.isArray(parsedData.orders)
          ? parsedData.orders
          : [],
        completedOrders: Array.isArray(
          parsedData.completedOrders
        )
          ? parsedData.completedOrders
          : [],
        plans: normalizedPlans,
      };
    }

    return {
      orders: Array.isArray(parsedData.orders)
        ? parsedData.orders
        : [],
      completedOrders: Array.isArray(
        parsedData.completedOrders
      )
        ? parsedData.completedOrders
        : [],
      plans: {
        [initialDate]: {
          trucks: normalizeTrucks(parsedData.trucks),
        },
      },
    };
  } catch (error) {
    console.error("Failed to load dispatch data:", error);

    return {
      orders: [],
      completedOrders: [],
      plans: {
        [initialDate]: {
          trucks: createDefaultTrucks(),
        },
      },
    };
  }
};

const sameId = (firstId, secondId) =>
  String(firstId) === String(secondId);

export default function useDispatch(selectedDate) {
  const activeDate = selectedDate || createDateKey();

  const [dispatchData, setDispatchData] = useState(() =>
    loadSavedData(activeDate)
  );

  const orders = dispatchData.orders;

  const completedOrders = Array.isArray(
    dispatchData.completedOrders
  )
    ? dispatchData.completedOrders
    : [];

  const trucks =
    dispatchData.plans[activeDate]?.trucks ||
    createDefaultTrucks();

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(dispatchData)
      );
    } catch (error) {
      console.error("Failed to save dispatch data:", error);
    }
  }, [dispatchData]);

  const setOrders = (value) => {
    setDispatchData((prev) => {
      const nextOrders =
        typeof value === "function"
          ? value(prev.orders)
          : value;

      return {
        ...prev,
        orders: Array.isArray(nextOrders)
          ? nextOrders
          : prev.orders,
      };
    });
  };

  const updateActiveTrucks = (updater) => {
    setDispatchData((prev) => {
      const currentTrucks =
        prev.plans[activeDate]?.trucks ||
        createDefaultTrucks();

      const updatedTrucks = updater(currentTrucks);

      return {
        ...prev,
        plans: {
          ...prev.plans,
          [activeDate]: {
            trucks: updatedTrucks,
          },
        },
      };
    });
  };

  const addTruck = () => {
    updateActiveTrucks((prev) => [
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
    updateActiveTrucks((prev) =>
      addRouteToTruck(prev, truckId)
    );
  };

  const deleteRoute = (truckId, routeId) => {
    setDispatchData((prev) => {
      const currentTrucks =
        prev.plans[activeDate]?.trucks ||
        createDefaultTrucks();

      const result = deleteRouteFromTruck(
        currentTrucks,
        truckId,
        routeId
      );

      const returnedOrderIds = new Set(
        prev.orders.map((order) => String(order.id))
      );

      const returnedOrders =
        result.returnedOrders.filter(
          (order) =>
            !returnedOrderIds.has(String(order.id))
        );

      return {
        ...prev,
        orders: [...prev.orders, ...returnedOrders],
        plans: {
          ...prev.plans,
          [activeDate]: {
            trucks: result.trucks,
          },
        },
      };
    });
  };

  const moveRoute = (truckId, routeId, direction) => {
    updateActiveTrucks((prev) =>
      moveRouteInTruck(
        prev,
        truckId,
        routeId,
        direction
      )
    );
  };

  const dropOrder = (
    orderId,
    targetTruckId,
    targetRouteId,
    sourceTruckId,
    sourceRouteId
  ) => {
    setDispatchData((prev) => {
      const currentTrucks =
        prev.plans[activeDate]?.trucks ||
        createDefaultTrucks();

      const isMovingFromRoute =
        Boolean(sourceTruckId) &&
        Boolean(sourceRouteId);

      if (
        isMovingFromRoute &&
        sameId(sourceTruckId, targetTruckId) &&
        sameId(sourceRouteId, targetRouteId)
      ) {
        return prev;
      }

      const targetExists = currentTrucks.some(
        (truck) =>
          sameId(truck.id, targetTruckId) &&
          truck.routes.some((route) =>
            sameId(route.id, targetRouteId)
          )
      );

      if (!targetExists) {
        return prev;
      }

      let orderToMove = null;

      if (isMovingFromRoute) {
        const sourceTruck = currentTrucks.find((truck) =>
          sameId(truck.id, sourceTruckId)
        );

        const sourceRoute = sourceTruck?.routes.find(
          (route) => sameId(route.id, sourceRouteId)
        );

        orderToMove = sourceRoute?.orders.find((order) =>
          sameId(order.id, orderId)
        );
      } else {
        orderToMove = prev.orders.find((order) =>
          sameId(order.id, orderId)
        );
      }

      if (!orderToMove) {
        return prev;
      }

      const updatedTrucks = currentTrucks.map((truck) => ({
        ...truck,
        routes: truck.routes.map((route) => {
          const isSourceRoute =
            isMovingFromRoute &&
            sameId(truck.id, sourceTruckId) &&
            sameId(route.id, sourceRouteId);

          const isTargetRoute =
            sameId(truck.id, targetTruckId) &&
            sameId(route.id, targetRouteId);

          let updatedOrders = route.orders;

          if (isSourceRoute) {
            updatedOrders = updatedOrders.filter(
              (order) => !sameId(order.id, orderId)
            );
          }

          if (isTargetRoute) {
            const alreadyExists = updatedOrders.some(
              (order) => sameId(order.id, orderId)
            );

            if (!alreadyExists) {
              updatedOrders = [
                ...updatedOrders,
                orderToMove,
              ];
            }
          }

          return {
            ...route,
            orders: updatedOrders,
          };
        }),
      }));

      return {
        ...prev,
        orders: isMovingFromRoute
          ? prev.orders
          : prev.orders.filter(
              (order) => !sameId(order.id, orderId)
            ),
        plans: {
          ...prev.plans,
          [activeDate]: {
            trucks: updatedTrucks,
          },
        },
      };
    });
  };

  const removeOrder = (orderId, truckId, routeId) => {
    setDispatchData((prev) => {
      const currentTrucks =
        prev.plans[activeDate]?.trucks ||
        createDefaultTrucks();

      const truck = currentTrucks.find((item) =>
        sameId(item.id, truckId)
      );

      const route = truck?.routes.find((item) =>
        sameId(item.id, routeId)
      );

      const orderToReturn = route?.orders.find((order) =>
        sameId(order.id, orderId)
      );

      if (!orderToReturn) {
        return prev;
      }

      const updatedTrucks = currentTrucks.map(
        (currentTruck) => {
          if (!sameId(currentTruck.id, truckId)) {
            return currentTruck;
          }

          return {
            ...currentTruck,
            routes: currentTruck.routes.map(
              (currentRoute) => {
                if (!sameId(currentRoute.id, routeId)) {
                  return currentRoute;
                }

                return {
                  ...currentRoute,
                  orders: currentRoute.orders.filter(
                    (order) =>
                      !sameId(order.id, orderId)
                  ),
                };
              }
            ),
          };
        }
      );

      const alreadyExists = prev.orders.some((order) =>
        sameId(order.id, orderId)
      );

      return {
        ...prev,
        orders: alreadyExists
          ? prev.orders
          : [...prev.orders, orderToReturn],
        plans: {
          ...prev.plans,
          [activeDate]: {
            trucks: updatedTrucks,
          },
        },
      };
    });
  };

  const completeOrder = (orderId, truckId, routeId) => {
    setDispatchData((prev) => {
      const currentTrucks =
        prev.plans[activeDate]?.trucks ||
        createDefaultTrucks();

      const truck = currentTrucks.find((item) =>
        sameId(item.id, truckId)
      );

      const route = truck?.routes.find((item) =>
        sameId(item.id, routeId)
      );

      const orderToComplete = route?.orders.find((order) =>
        sameId(order.id, orderId)
      );

      if (!orderToComplete) {
        return prev;
      }

      const alreadyCompleted = (
        prev.completedOrders || []
      ).some((order) => sameId(order.id, orderId));

      if (alreadyCompleted) {
        return prev;
      }

      const updatedTrucks = currentTrucks.map(
        (currentTruck) => {
          if (!sameId(currentTruck.id, truckId)) {
            return currentTruck;
          }

          return {
            ...currentTruck,
            routes: currentTruck.routes.map(
              (currentRoute) => {
                if (!sameId(currentRoute.id, routeId)) {
                  return currentRoute;
                }

                return {
                  ...currentRoute,
                  orders: currentRoute.orders.filter(
                    (order) =>
                      !sameId(order.id, orderId)
                  ),
                };
              }
            ),
          };
        }
      );

      const completedOrder = {
        ...orderToComplete,
        truckId: truck.id,
        truckName: truck.name,
        routeId: route.id,
        routeName: route.name,
        plannedDate: activeDate,
        completedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        completedOrders: [
          completedOrder,
          ...(prev.completedOrders || []),
        ],
        plans: {
          ...prev.plans,
          [activeDate]: {
            trucks: updatedTrucks,
          },
        },
      };
    });
  };

  return {
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
  };
}