import { useEffect } from "react";
import { supabase } from "../supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

export function useRealtimeSync<T extends Record<string, any>>(
  table: string,
  onUpdate: (payload: T) => void,
  filter?: Record<string, any>,
) {
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      channel = supabase.channel(`public:${table}`);

      channel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: table,
            ...filter,
          },
          (payload) => {
            if (payload.new) {
              onUpdate(payload.new as T);
            }
          },
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, onUpdate, filter]);
}
