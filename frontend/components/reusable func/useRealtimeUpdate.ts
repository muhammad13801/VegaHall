import { useFocusEffect } from "@react-navigation/native";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useRef, useCallback } from "react";
import { supabase } from "../Services/supabaseClient";

interface UseRealtimeUpdatesProps {
  userId?: string;
  onNotificationsChange?: (count: number) => void;
}

export const useRealtimeUpdates = ({
  userId,
  onNotificationsChange,
}: UseRealtimeUpdatesProps) => {
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchNotificationCount = async () => {
    if (!userId || !onNotificationsChange) return;

    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", Number(userId))
      .eq("is_read", false);

    if (error) {
      console.log("fetchNotificationCount error:", error);
      return;
    }

    onNotificationsChange(count || 0);
  };

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      let isActive = true;

      const setupRealtime = async () => {
        try {
          // cleanup old channel first
          if (channelRef.current) {
            await supabase.removeChannel(channelRef.current);
            channelRef.current = null;
          }

          // prevents race conditions
          await new Promise((resolve) => setTimeout(resolve, 100));

          if (!isActive) return;

          // unique channel name
          const channel = supabase.channel(
            `notifications-${userId}-${Date.now()}`,
          );

          // realtime notifications listener
          channel.on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${userId}`,
            },
            async () => {
              if (!isActive) return;

              await fetchNotificationCount();
            },
          );

          channelRef.current = channel;

          // Subscribe to the channel
          channel.subscribe();

          // initial fetch
          await fetchNotificationCount();
        } catch (err) {
          console.log("setupRealtime error:", err);
        }
      };

      setupRealtime();

      return () => {
        isActive = false;

        const cleanup = async () => {
          if (channelRef.current) {
            await supabase.removeChannel(channelRef.current);
            channelRef.current = null;
          }
        };

        cleanup();
      };
    }, [userId]),
  );
};
