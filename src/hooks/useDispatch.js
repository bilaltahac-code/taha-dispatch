import { useEffect, useRef, useState } from "react";

import {
  addRouteToTruck,
  deleteRouteFromTruck,
  moveRouteInTruck,
} from "./useRoutes";

import {
  loadDispatchData as loadCloudDispatchData,
  saveDispatchData as saveCloudDispatchData,
  subscribeToDispatchData,
} from "../services/dispatchApi";

const STORAGE_KEY = "taha-dispatch-data-v1";

const PERMANENT_TRUCK_IDS = new Set(["az", "zbidat"]);

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
        note: "",
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
        note: "",
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
            note: route.note || "",
            orders: Array.isArray(route.orders)
              ? route.orders
              : [],
          }))
        : [
            {
              id: crypto.randomUUID(),
              name: "מסלול 1",
              note: "",
              orders: [],
            },
          ],
  }));
};

const removeDispatchDetails = (order) => {
  const restoredOrder = {
    ...order,
    dispatched: false,
    dispatchedAt: null,
  };

  delete restoredOrder.truckId;
  delete restoredOrder.truckName;
  delete restoredOrder.routeId;
  delete restoredOrder.routeName;
  delete restoredOrder.plannedDate;
  delete restoredOrder.completedAt;

  return restoredOrder;
};

const closePreviousDaysAutomatically = (
  dispatchData,
  todayKey
) => {
  const currentOrders = Array.isArray(dispatchData.orders)
    ? [...dispatchData.orders]
    : [];

  const currentCompletedOrders = Array.isArray(
    dispatchData.completedOrders
  )
    ? [...dispatchData.completedOrders]
    : [];

  const orderIds = new Set(
    currentOrders.map((order) => String(order.id))
  );

  const completedOrderIds = new Set(
    currentCompletedOrders.map((order) =>
      String(order.id)
    )
  );

  const automaticallyCompletedOrders = [];
  const returnedOrders = [];
  const updatedPlans = {};

  const automaticCompletedAt = new Date().toISOString();

  Object.entries(dispatchData.plans || {}).forEach(
    ([dateKey, plan]) => {
      const normalizedTrucks = normalizeTrucks(
        plan?.trucks
      );

      if (dateKey >= todayKey) {
        updatedPlans[dateKey] = {
          ...plan,
          trucks: normalizedTrucks,
        };

        return;
      }

      const clearedTrucks = normalizedTrucks.map(
        (truck) => ({
          ...truck,
          routes: truck.routes.map((route) => {
            route.orders.forEach((order) => {
              const orderId = String(order.id);

              if (Boolean(order.dispatched)) {
                if (completedOrderIds.has(orderId)) {
                  return;
                }

                completedOrderIds.add(orderId);

                automaticallyCompletedOrders.push({
                  ...order,
                  truckId: truck.id,
                  truckName: truck.name,
                  routeId: route.id,
                  routeName: route.name,
                  plannedDate: dateKey,
                  completedAt:
                    order.dispatchedAt ||
                    automaticCompletedAt,
                });

                return;
              }

              if (
                orderIds.has(orderId) ||
                completedOrderIds.has(orderId)
              ) {
                return;
              }

              orderIds.add(orderId);

              returnedOrders.push(
                removeDispatchDetails(order)
              );
            });

            return {
              ...route,
              orders: [],
            };
          }),
        })
      );

      updatedPlans[dateKey] = {
        ...plan,
        trucks: clearedTrucks,
      };
    }
  );

  const allCompletedOrderIds = new Set([
    ...completedOrderIds,
  ]);

  return {
    ...dispatchData,
    orders: [
      ...currentOrders.filter(
        (order) =>
          !allCompletedOrderIds.has(String(order.id))
      ),
      ...returnedOrders,
    ],
    completedOrders: [
      ...automaticallyCompletedOrders,
      ...currentCompletedOrders,
    ],
    plans: updatedPlans,
  };
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

const updateOrderInTrucks = (
  trucks,
  orderId,
  changes
) => {
  return trucks.map((truck) => ({
    ...truck,
    routes: truck.routes.map((route) => ({
      ...route,
      orders: route.orders.map((order) =>
        sameId(order.id, orderId)
          ? {
              ...order,
              ...changes,
            }
          : order
      ),
    })),
  }));
};

const hasMeaningfulDispatchData = (data) => {
  if (!data || typeof data !== "object") {
    return false;
  }

  const hasOrders = Array.isArray(data.orders) && data.orders.length > 0;
  const hasCompletedOrders =
    Array.isArray(data.completedOrders) &&
    data.completedOrders.length > 0;
  const hasPlans =
    data.plans &&
    typeof data.plans === "object" &&
    Object.keys(data.plans).length > 0;

  return hasOrders || hasCompletedOrders || hasPlans;
};

export default function useDispatch(selectedDate) {
  const activeDate = selectedDate || createDateKey();

  const [dispatchData, setDispatchData] = useState(() => {
    const savedData = loadSavedData(activeDate);

    return closePreviousDaysAutomatically(
      savedData,
      createDateKey()
    );
  });

  const dispatchDataRef = useRef(dispatchData);
  const cloudReadyRef = useRef(false);
  const lastCloudSnapshotRef = useRef("");

  useEffect(() => {
    dispatchDataRef.current = dispatchData;
  }, [dispatchData]);

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
    const snapshot = JSON.stringify(dispatchData);

    try {
      localStorage.setItem(STORAGE_KEY, snapshot);
    } catch (error) {
      console.error("Failed to save local dispatch data:", error);
    }

    if (
      !cloudReadyRef.current ||
      snapshot === lastCloudSnapshotRef.current
    ) {
      return undefined;
    }

    const saveTimeout = window.setTimeout(async () => {
      try {
        await saveCloudDispatchData(dispatchData);
        lastCloudSnapshotRef.current = snapshot;
      } catch (error) {
        console.error("Failed to save cloud dispatch data:", error);
      }
    }, 350);

    return () => window.clearTimeout(saveTimeout);
  }, [dispatchData]);

  useEffect(() => {
    let isActive = true;
    let unsubscribe = () => {};

    const initializeCloudSync = async () => {
      try {
        const cloudData = await loadCloudDispatchData();

        if (!isActive) {
          return;
        }

        const localData = dispatchDataRef.current;
        const cloudHasData = hasMeaningfulDispatchData(cloudData);
        const localHasData = hasMeaningfulDispatchData(localData);

        if (cloudHasData) {
          const normalizedCloudData =
            closePreviousDaysAutomatically(
              cloudData,
              createDateKey()
            );

          const cloudSnapshot = JSON.stringify(
            normalizedCloudData
          );

          lastCloudSnapshotRef.current = cloudSnapshot;
          dispatchDataRef.current = normalizedCloudData;
          setDispatchData(normalizedCloudData);
        } else if (localHasData) {
          await saveCloudDispatchData(localData);
          lastCloudSnapshotRef.current = JSON.stringify(localData);
        } else {
          lastCloudSnapshotRef.current = JSON.stringify(cloudData);
        }

        if (!isActive) {
          return;
        }

        cloudReadyRef.current = true;

        unsubscribe = subscribeToDispatchData((nextCloudData) => {
          if (!isActive) {
            return;
          }

          const normalizedCloudData =
            closePreviousDaysAutomatically(
              nextCloudData,
              createDateKey()
            );

          const nextSnapshot = JSON.stringify(
            normalizedCloudData
          );

          if (nextSnapshot === lastCloudSnapshotRef.current) {
            return;
          }

          lastCloudSnapshotRef.current = nextSnapshot;

          if (
            nextSnapshot ===
            JSON.stringify(dispatchDataRef.current)
          ) {
            return;
          }

          dispatchDataRef.current = normalizedCloudData;
          setDispatchData(normalizedCloudData);
        });
      } catch (error) {
        console.error("Failed to initialize Supabase sync:", error);
      }
    };

    initializeCloudSync();

    return () => {
      isActive = false;
      cloudReadyRef.current = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let midnightTimeout;
    let safetyInterval;

    const updateToCurrentDay = () => {
      setDispatchData((previousData) =>
        closePreviousDaysAutomatically(
          previousData,
          createDateKey()
        )
      );
    };

    const scheduleMidnightUpdate = () => {
      const now = new Date();

      const nextMidnight = new Date(now);
      nextMidnight.setDate(nextMidnight.getDate() + 1);
      nextMidnight.setHours(0, 0, 1, 0);

      const millisecondsUntilMidnight =
        nextMidnight.getTime() - now.getTime();

      midnightTimeout = window.setTimeout(() => {
        updateToCurrentDay();

        safetyInterval = window.setInterval(
          updateToCurrentDay,
          60 * 60 * 1000
        );
      }, millisecondsUntilMidnight);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateToCurrentDay();
      }
    };

    scheduleMidnightUpdate();

    window.addEventListener("focus", updateToCurrentDay);

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.clearTimeout(midnightTimeout);
      window.clearInterval(safetyInterval);

      window.removeEventListener(
        "focus",
        updateToCurrentDay
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

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

  const deleteOrder = (orderId) => {
    setDispatchData((prev) => ({
      ...prev,
      orders: prev.orders.filter(
        (order) => !sameId(order.id, orderId)
      ),
    }));
  };

  const updateOrder = (orderId, changes) => {
    if (
      !changes ||
      typeof changes !== "object" ||
      Array.isArray(changes)
    ) {
      return;
    }

    setDispatchData((prev) => {
      const updatedPlans = {};

      Object.entries(prev.plans || {}).forEach(
        ([dateKey, plan]) => {
          updatedPlans[dateKey] = {
            ...plan,
            trucks: updateOrderInTrucks(
              normalizeTrucks(plan?.trucks),
              orderId,
              changes
            ),
          };
        }
      );

      return {
        ...prev,
        orders: prev.orders.map((order) =>
          sameId(order.id, orderId)
            ? {
                ...order,
                ...changes,
              }
            : order
        ),
        completedOrders: (
          prev.completedOrders || []
        ).map((order) =>
          sameId(order.id, orderId)
            ? {
                ...order,
                ...changes,
              }
            : order
        ),
        plans: updatedPlans,
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

  const renameTruck = (truckId, newName) => {
    updateActiveTrucks((prev) =>
      prev.map((truck) =>
        sameId(truck.id, truckId)
          ? {
              ...truck,
              name: newName,
            }
          : truck
      )
    );
  };

  const updateRouteNote = (
    truckId,
    routeId,
    note
  ) => {
    updateActiveTrucks((prev) =>
      prev.map((truck) => {
        if (!sameId(truck.id, truckId)) {
          return truck;
        }

        return {
          ...truck,
          routes: truck.routes.map((route) =>
            sameId(route.id, routeId)
              ? {
                  ...route,
                  note,
                }
              : route
          ),
        };
      })
    );
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
            note: "",
            orders: [],
          },
        ],
      },
    ]);
  };

  const deleteTruck = (truckId) => {
    if (PERMANENT_TRUCK_IDS.has(String(truckId))) {
      return;
    }

    setDispatchData((prev) => {
      const currentTrucks =
        prev.plans[activeDate]?.trucks ||
        createDefaultTrucks();

      const truckToDelete = currentTrucks.find((truck) =>
        sameId(truck.id, truckId)
      );

      if (!truckToDelete) {
        return prev;
      }

      const existingOrderIds = new Set(
        prev.orders.map((order) => String(order.id))
      );

      const returnedOrders = truckToDelete.routes.flatMap(
        (route) =>
          route.orders
            .filter(
              (order) =>
                !existingOrderIds.has(String(order.id))
            )
            .map((order) => {
              existingOrderIds.add(String(order.id));

              return {
                ...order,
                dispatched: false,
                dispatchedAt: null,
              };
            })
      );

      const updatedTrucks = currentTrucks.filter(
        (truck) => !sameId(truck.id, truckId)
      );

      return {
        ...prev,
        orders: [...prev.orders, ...returnedOrders],
        plans: {
          ...prev.plans,
          [activeDate]: {
            trucks: updatedTrucks,
          },
        },
      };
    });
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
          : [
              ...prev.orders,
              {
                ...orderToReturn,
                dispatched: false,
                dispatchedAt: null,
              },
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

  const toggleOrderDispatched = (
    orderId,
    truckId,
    routeId
  ) => {
    setDispatchData((prev) => {
      const currentTrucks =
        prev.plans[activeDate]?.trucks ||
        createDefaultTrucks();

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
                  orders: currentRoute.orders.map(
                    (order) => {
                      if (!sameId(order.id, orderId)) {
                        return order;
                      }

                      const nextDispatched =
                        !Boolean(order.dispatched);

                      return {
                        ...order,
                        dispatched: nextDispatched,
                        dispatchedAt: nextDispatched
                          ? new Date().toISOString()
                          : null,
                      };
                    }
                  ),
                };
              }
            ),
          };
        }
      );

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

  const finishDay = () => {
    setDispatchData((prev) => {
      const currentTrucks =
        prev.plans[activeDate]?.trucks ||
        createDefaultTrucks();

      const completedAt = new Date().toISOString();

      const existingCompletedIds = new Set(
        (prev.completedOrders || []).map(
          (order) => String(order.id)
        )
      );

      const dispatchedOrders = [];

      const updatedTrucks = currentTrucks.map((truck) => ({
        ...truck,
        routes: truck.routes.map((route) => {
          const ordersToComplete = route.orders.filter(
            (order) => Boolean(order.dispatched)
          );

          ordersToComplete.forEach((order) => {
            if (
              existingCompletedIds.has(String(order.id))
            ) {
              return;
            }

            existingCompletedIds.add(String(order.id));

            dispatchedOrders.push({
              ...order,
              truckId: truck.id,
              truckName: truck.name,
              routeId: route.id,
              routeName: route.name,
              plannedDate: activeDate,
              completedAt,
            });
          });

          return {
            ...route,
            orders: route.orders.filter(
              (order) => !Boolean(order.dispatched)
            ),
          };
        }),
      }));

      if (dispatchedOrders.length === 0) {
        return prev;
      }

      return {
        ...prev,
        completedOrders: [
          ...dispatchedOrders,
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

  const restoreCompletedOrder = (orderId) => {
    setDispatchData((prev) => {
      const completedOrder = (
        prev.completedOrders || []
      ).find((order) => sameId(order.id, orderId));

      if (!completedOrder) {
        return prev;
      }

      const alreadyExists = prev.orders.some((order) =>
        sameId(order.id, orderId)
      );

      const restoredOrder =
        removeDispatchDetails(completedOrder);

      return {
        ...prev,
        orders: alreadyExists
          ? prev.orders
          : [...prev.orders, restoredOrder],
        completedOrders: (
          prev.completedOrders || []
        ).filter(
          (order) => !sameId(order.id, orderId)
        ),
      };
    });
  };

  return {
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
    finishDay,
  };
}