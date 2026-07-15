export function addRouteToTruck(trucks, truckId) {
  return trucks.map((truck) => {
    if (truck.id !== truckId) {
      return truck;
    }

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
  });
}

export function deleteRouteFromTruck(trucks, truckId, routeId) {
  let returnedOrders = [];

  const updatedTrucks = trucks.map((truck) => {
    if (truck.id !== truckId) {
      return truck;
    }

    const routeIndex = truck.routes.findIndex(
      (route) => route.id === routeId
    );

    if (routeIndex <= 0) {
      return truck;
    }

    returnedOrders = truck.routes[routeIndex].orders;

    const remainingRoutes = truck.routes.filter(
      (route) => route.id !== routeId
    );

    return {
      ...truck,
      routes: remainingRoutes.map((route, index) => ({
        ...route,
        name: `מסלול ${index + 1}`,
      })),
    };
  });

  return {
    trucks: updatedTrucks,
    returnedOrders,
  };
}

export function moveRouteInTruck(
  trucks,
  truckId,
  routeId,
  direction
) {
  return trucks.map((truck) => {
    if (truck.id !== truckId) {
      return truck;
    }

    const currentIndex = truck.routes.findIndex(
      (route) => route.id === routeId
    );

    if (currentIndex === -1) {
      return truck;
    }

    const targetIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= truck.routes.length
    ) {
      return truck;
    }

    const updatedRoutes = [...truck.routes];

    [updatedRoutes[currentIndex], updatedRoutes[targetIndex]] = [
      updatedRoutes[targetIndex],
      updatedRoutes[currentIndex],
    ];

    return {
      ...truck,
      routes: updatedRoutes.map((route, index) => ({
        ...route,
        name: `מסלול ${index + 1}`,
      })),
    };
  });
}