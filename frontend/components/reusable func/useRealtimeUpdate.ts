import { useCallback, useEffect, useRef } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../Services/supabaseClient";
import { useFocusEffect } from "@react-navigation/native";

interface UseRealtimeUpdatesProps {
  userId: string;
  onNotificationsChange: (count: number) => void;
  onBookingsChange: (count: number) => void;
}

export const useRealtimeUpdates = ({
  userId,
  onNotificationsChange,
  onBookingsChange,
}: UseRealtimeUpdatesProps) => {
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchNotificationCount = async () => {
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", Number(userId))
      .eq("is_read", false);

    onNotificationsChange(count || 0);
  };

  const fetchBookingCount = async () => {
    const { count } = await supabase
      .from("bookings")
      .select("*, halls!inner(owner_id)", {
        count: "exact",
        head: true,
      })
      .eq("halls.owner_id", Number(userId))
      .eq("is_read", false);

    onBookingsChange(count || 0);
  };

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      let isActive = true;

      const setupRealtime = async () => {
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
          channelRef.current = null;
          await new Promise((r) => setTimeout(r, 50));
        }

        if (!isActive) return;

        const channel = supabase.channel(`user-updates-${userId}`);

        channel.on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetchNotificationCount();
          },
        );

        channel.on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
          },
          () => {
            fetchBookingCount();
          },
        );

        channel.subscribe();

        channelRef.current = channel;

        fetchNotificationCount();
        fetchBookingCount();
      };

      setupRealtime();

      return () => {
        isActive = false;

        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      };
    }, [userId]),
  );
};
