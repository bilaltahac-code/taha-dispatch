import { supabase } from "../lib/supabase";

const TABLE_NAME = "dispatch_state";
const STATE_ID = "main";

const OFFLINE_QUEUE_KEY =
  "taha-dispatch-offline-queue-v1";

const CLOUD_VERSION_KEY =
  "taha-dispatch-cloud-version-v1";

const DEVICE_ID_KEY =
  "taha-dispatch-device-id-v1";

const DEVICE_NAME_KEY =
  "taha-dispatch-device-name-v1";

const USER_NAME_KEY =
  "taha-dispatch-user-name-v1";

const createEmptyDispatchData = () => ({
  orders: [],
  completedOrders: [],
  plans: {},
});

const normalizeDispatchData = (data) => {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return createEmptyDispatchData();
  }

  return {
    orders: Array.isArray(data.orders)
      ? data.orders
      : [],

    completedOrders: Array.isArray(
      data.completedOrders
    )
      ? data.completedOrders
      : [],

    plans:
      data.plans &&
      typeof data.plans === "object" &&
      !Array.isArray(data.plans)
        ? data.plans
        : {},
  };
};

const getStoredValue = (key, fallback = "") => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

const setStoredValue = (key, value) => {
  try {
    localStorage.setItem(key, String(value));
  } catch (error) {
    console.error(
      `Failed to save local value: ${key}`,
      error
    );
  }
};

const getOrCreateDeviceId = () => {
  const storedDeviceId =
    getStoredValue(DEVICE_ID_KEY);

  if (storedDeviceId) {
    return storedDeviceId;
  }

  const newDeviceId =
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `device-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

  setStoredValue(DEVICE_ID_KEY, newDeviceId);

  return newDeviceId;
};

const getDeviceName = () => {
  const storedDeviceName =
    getStoredValue(DEVICE_NAME_KEY);

  if (storedDeviceName) {
    return storedDeviceName;
  }

  const deviceId = getOrCreateDeviceId();

  const defaultName = `מחשב-${deviceId
    .replace(/-/g, "")
    .slice(-6)
    .toUpperCase()}`;

  setStoredValue(DEVICE_NAME_KEY, defaultName);

  return defaultName;
};

const getUserName = () => {
  return (
    getStoredValue(USER_NAME_KEY) ||
    "משתמש לא מוגדר"
  );
};

const getEditorInformation = () => ({
  userName: getUserName(),
  deviceName: getDeviceName(),
  deviceId: getOrCreateDeviceId(),
});

const createSyncMetadata = () => {
  const editor = getEditorInformation();

  return {
    updatedBy: editor.userName,
    deviceName: editor.deviceName,
    deviceId: editor.deviceId,
    updatedAt: new Date().toISOString(),
  };
};

const getMetadataFromRow = (row) => {
  const syncData =
    row?.data &&
    typeof row.data === "object" &&
    !Array.isArray(row.data)
      ? row.data.__sync
      : null;

  return {
    updatedAt:
      row?.updated_at ||
      syncData?.updatedAt ||
      null,

    updatedBy:
      syncData?.updatedBy ||
      "משתמש לא מוגדר",

    deviceName:
      syncData?.deviceName ||
      "מחשב לא ידוע",

    deviceId:
      syncData?.deviceId ||
      null,
  };
};

const createCloudPayload = (dispatchData) => {
  const normalizedData =
    normalizeDispatchData(dispatchData);

  const syncMetadata = createSyncMetadata();

  return {
    normalizedData,

    cloudData: {
      ...normalizedData,
      __sync: syncMetadata,
    },

    syncMetadata,
  };
};

const getLastCloudVersion = () => {
  return getStoredValue(CLOUD_VERSION_KEY) || null;
};

const setLastCloudVersion = (updatedAt) => {
  if (!updatedAt) {
    return;
  }

  setStoredValue(CLOUD_VERSION_KEY, updatedAt);
};

const loadOfflineQueue = () => {
  try {
    const savedQueue =
      localStorage.getItem(OFFLINE_QUEUE_KEY);

    if (!savedQueue) {
      return [];
    }

    const parsedQueue = JSON.parse(savedQueue);

    return Array.isArray(parsedQueue)
      ? parsedQueue
      : [];
  } catch (error) {
    console.error(
      "Failed to load offline queue:",
      error
    );

    return [];
  }
};

const saveOfflineQueue = (queue) => {
  try {
    localStorage.setItem(
      OFFLINE_QUEUE_KEY,
      JSON.stringify(queue)
    );
  } catch (error) {
    console.error(
      "Failed to save offline queue:",
      error
    );
  }
};

const addToOfflineQueue = (dispatchData) => {
  const normalizedData =
    normalizeDispatchData(dispatchData);

  const queue = loadOfflineQueue();

  const nextItem = {
    id:
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `queue-${Date.now()}`,

    data: normalizedData,
    createdAt: new Date().toISOString(),
    editor: getEditorInformation(),
  };

  /*
   * نحتفظ بآخر نسخة فقط.
   * لأنها تحتوي الحالة الكاملة للبرنامج،
   * وليس عملية صغيرة منفصلة.
   */
  saveOfflineQueue([nextItem]);

  return nextItem;
};

const removeOfflineQueue = () => {
  saveOfflineQueue([]);
};

const isNetworkError = (error) => {
  const message = String(
    error?.message || error || ""
  ).toLowerCase();

  return (
    !navigator.onLine ||
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("fetch")
  );
};

const dataIsEqual = (firstData, secondData) => {
  try {
    return (
      JSON.stringify(
        normalizeDispatchData(firstData)
      ) ===
      JSON.stringify(
        normalizeDispatchData(secondData)
      )
    );
  } catch {
    return false;
  }
};

export class DispatchConflictError extends Error {
  constructor({
    localData,
    remoteData,
    remoteMetadata,
  }) {
    super(
      "The dispatch data was changed by another device."
    );

    this.name = "DispatchConflictError";
    this.code = "DISPATCH_CONFLICT";
    this.localData =
      normalizeDispatchData(localData);
    this.remoteData =
      normalizeDispatchData(remoteData);
    this.remoteMetadata = remoteMetadata;
  }
}

const readCloudRow = async () => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id, data, updated_at")
    .eq("id", STATE_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

const insertInitialRow = async (
  cloudData,
  syncMetadata
) => {
  const updatedAt =
    syncMetadata.updatedAt ||
    new Date().toISOString();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      id: STATE_ID,
      data: cloudData,
      updated_at: updatedAt,
    })
    .select("id, data, updated_at")
    .single();

  if (error) {
    throw error;
  }

  setLastCloudVersion(data.updated_at);

  return data;
};

const updateCloudRowSafely = async ({
  cloudData,
  localData,
  expectedUpdatedAt,
  force = false,
}) => {
  const nextUpdatedAt = new Date().toISOString();

  let query = supabase
    .from(TABLE_NAME)
    .update({
      data: cloudData,
      updated_at: nextUpdatedAt,
    })
    .eq("id", STATE_ID);

  if (!force && expectedUpdatedAt) {
    query = query.eq(
      "updated_at",
      expectedUpdatedAt
    );
  }

  const { data, error } = await query
    .select("id, data, updated_at");

  if (error) {
    throw error;
  }

  if (
    !force &&
    expectedUpdatedAt &&
    (!Array.isArray(data) || data.length === 0)
  ) {
    const remoteRow = await readCloudRow();

    throw new DispatchConflictError({
      localData,
      remoteData: remoteRow?.data,
      remoteMetadata:
        getMetadataFromRow(remoteRow),
    });
  }

  const savedRow = Array.isArray(data)
    ? data[0]
    : data;

  if (savedRow?.updated_at) {
    setLastCloudVersion(savedRow.updated_at);
  }

  return savedRow;
};

export const setDispatchEditor = ({
  userName,
  deviceName,
} = {}) => {
  if (
    typeof userName === "string" &&
    userName.trim()
  ) {
    setStoredValue(
      USER_NAME_KEY,
      userName.trim()
    );
  }

  if (
    typeof deviceName === "string" &&
    deviceName.trim()
  ) {
    setStoredValue(
      DEVICE_NAME_KEY,
      deviceName.trim()
    );
  }

  return getEditorInformation();
};

export const getDispatchEditor = () => {
  return getEditorInformation();
};

export const getPendingDispatchChanges = () => {
  return loadOfflineQueue();
};

export const hasPendingDispatchChanges = () => {
  return loadOfflineQueue().length > 0;
};

export const loadDispatchData = async () => {
  try {
    const row = await readCloudRow();

    if (!row) {
      const emptyData =
        createEmptyDispatchData();

      const payload =
        createCloudPayload(emptyData);

      await insertInitialRow(
        payload.cloudData,
        payload.syncMetadata
      );

      removeOfflineQueue();

      return emptyData;
    }

    setLastCloudVersion(row.updated_at);

    return normalizeDispatchData(row.data);
  } catch (error) {
    console.error(
      "Failed to load dispatch data from Supabase:",
      error
    );

    throw error;
  }
};

export const saveDispatchData = async (
  dispatchData,
  options = {}
) => {
  const {
    force = false,
    queueWhenOffline = true,
  } = options;

  const normalizedData =
    normalizeDispatchData(dispatchData);

  if (!navigator.onLine) {
    if (queueWhenOffline) {
      addToOfflineQueue(normalizedData);
    }

    return {
      data: normalizedData,
      savedToCloud: false,
      queuedOffline: true,
      metadata: createSyncMetadata(),
    };
  }

  try {
    const currentRow = await readCloudRow();

    const payload =
      createCloudPayload(normalizedData);

    if (!currentRow) {
      const insertedRow =
        await insertInitialRow(
          payload.cloudData,
          payload.syncMetadata
        );

      removeOfflineQueue();

      return {
        data: normalizedData,
        savedToCloud: true,
        queuedOffline: false,
        metadata:
          getMetadataFromRow(insertedRow),
      };
    }

    const expectedUpdatedAt =
      getLastCloudVersion();

    if (
      !force &&
      expectedUpdatedAt &&
      currentRow.updated_at !== expectedUpdatedAt
    ) {
      const remoteData =
        normalizeDispatchData(
          currentRow.data
        );

      if (
        !dataIsEqual(
          normalizedData,
          remoteData
        )
      ) {
        throw new DispatchConflictError({
          localData: normalizedData,
          remoteData,
          remoteMetadata:
            getMetadataFromRow(currentRow),
        });
      }

      setLastCloudVersion(
        currentRow.updated_at
      );

      removeOfflineQueue();

      return {
        data: normalizedData,
        savedToCloud: true,
        queuedOffline: false,
        metadata:
          getMetadataFromRow(currentRow),
      };
    }

    const savedRow =
      await updateCloudRowSafely({
        cloudData: payload.cloudData,
        localData: normalizedData,
        expectedUpdatedAt:
          expectedUpdatedAt ||
          currentRow.updated_at,
        force,
      });

    removeOfflineQueue();

    return {
      data: normalizedData,
      savedToCloud: true,
      queuedOffline: false,
      metadata:
        getMetadataFromRow(savedRow),
    };
  } catch (error) {
    if (
      isNetworkError(error) &&
      queueWhenOffline
    ) {
      addToOfflineQueue(normalizedData);

      return {
        data: normalizedData,
        savedToCloud: false,
        queuedOffline: true,
        metadata: createSyncMetadata(),
      };
    }

    console.error(
      "Failed to save dispatch data to Supabase:",
      error
    );

    throw error;
  }
};

export const forceSaveDispatchData = async (
  dispatchData
) => {
  return saveDispatchData(dispatchData, {
    force: true,
    queueWhenOffline: true,
  });
};

export const flushOfflineDispatchQueue =
  async () => {
    const queue = loadOfflineQueue();

    if (
      queue.length === 0 ||
      !navigator.onLine
    ) {
      return {
        synced: false,
        pending: queue.length,
      };
    }

    const latestItem =
      queue[queue.length - 1];

    const result = await saveDispatchData(
      latestItem.data,
      {
        force: false,
        queueWhenOffline: false,
      }
    );

    removeOfflineQueue();

    return {
      synced: true,
      pending: 0,
      result,
    };
  };

export const subscribeToDispatchData = (
  onDataChange,
  onConflict = null,
  onConnectionChange = null
) => {
  if (typeof onDataChange !== "function") {
    throw new Error(
      "onDataChange must be a function"
    );
  }

  const channel = supabase
    .channel("taha-dispatch-state")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: TABLE_NAME,
        filter: `id=eq.${STATE_ID}`,
      },
      (payload) => {
        const newRow = payload.new;

        if (
          !newRow ||
          newRow.id !== STATE_ID
        ) {
          return;
        }

        const remoteData =
          normalizeDispatchData(
            newRow.data
          );

        const remoteMetadata =
          getMetadataFromRow(newRow);

        const localVersion =
          getLastCloudVersion();

        const hasPendingChanges =
          hasPendingDispatchChanges();

        if (
          hasPendingChanges &&
          localVersion &&
          newRow.updated_at !== localVersion
        ) {
          if (
            typeof onConflict === "function"
          ) {
            onConflict({
              remoteData,
              remoteMetadata,
            });
          }

          return;
        }

        setLastCloudVersion(
          newRow.updated_at
        );

        onDataChange(
          remoteData,
          remoteMetadata
        );
      }
    )
    .subscribe((status) => {
      if (
        typeof onConnectionChange ===
        "function"
      ) {
        onConnectionChange(status);
      }

      if (status === "CHANNEL_ERROR") {
        console.error(
          "Supabase Realtime connection failed"
        );
      }
    });

  const handleOnline = async () => {
    if (
      typeof onConnectionChange ===
      "function"
    ) {
      onConnectionChange("ONLINE");
    }

    try {
      await flushOfflineDispatchQueue();
    } catch (error) {
      if (
        error instanceof DispatchConflictError
      ) {
        if (
          typeof onConflict === "function"
        ) {
          onConflict({
            localData: error.localData,
            remoteData: error.remoteData,
            remoteMetadata:
              error.remoteMetadata,
          });
        }

        return;
      }

      console.error(
        "Failed to synchronize offline changes:",
        error
      );
    }
  };

  const handleOffline = () => {
    if (
      typeof onConnectionChange ===
      "function"
    ) {
      onConnectionChange("OFFLINE");
    }
  };

  window.addEventListener(
    "online",
    handleOnline
  );

  window.addEventListener(
    "offline",
    handleOffline
  );

  return () => {
    window.removeEventListener(
      "online",
      handleOnline
    );

    window.removeEventListener(
      "offline",
      handleOffline
    );

    supabase.removeChannel(channel);
  };
};