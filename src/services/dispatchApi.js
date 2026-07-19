import { supabase } from "../lib/supabase";

const TABLE_NAME = "dispatch_state";
const STATE_ID = "main";

const createEmptyDispatchData = () => ({
  orders: [],
  completedOrders: [],
  plans: {},
});

const normalizeDispatchData = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return createEmptyDispatchData();
  }

  return {
    orders: Array.isArray(data.orders) ? data.orders : [],
    completedOrders: Array.isArray(data.completedOrders)
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

export const loadDispatchData = async () => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("data")
    .eq("id", STATE_ID)
    .maybeSingle();

  if (error) {
    console.error("Failed to load dispatch data from Supabase:", error);
    throw error;
  }

  if (!data) {
    const emptyData = createEmptyDispatchData();

    await saveDispatchData(emptyData);

    return emptyData;
  }

  return normalizeDispatchData(data.data);
};

export const saveDispatchData = async (dispatchData) => {
  const normalizedData = normalizeDispatchData(dispatchData);

  const { error } = await supabase.from(TABLE_NAME).upsert(
    {
      id: STATE_ID,
      data: normalizedData,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
    }
  );

  if (error) {
    console.error("Failed to save dispatch data to Supabase:", error);
    throw error;
  }

  return normalizedData;
};

export const subscribeToDispatchData = (onDataChange) => {
  if (typeof onDataChange !== "function") {
    throw new Error("onDataChange must be a function");
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

        if (!newRow || newRow.id !== STATE_ID) {
          return;
        }

        onDataChange(normalizeDispatchData(newRow.data));
      }
    )
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR") {
        console.error("Supabase Realtime connection failed");
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
};