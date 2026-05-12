import { useFocusEffect } from "@react-navigation/native";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useRef, useCallback } from "react";
import { supabase } from "../Services/supabaseClient";

interface UseRealtimeUpdatesProps {
  userId: string;
  userRole: "owner" | "customer";
  onNotificationsChange: (count: number) => void;
  onBookingsChange: (count: number) => void;
}

export const useRealtimeUpdates = ({
  userId,
  userRole,
  onNotificationsChange,
  onBookingsChange,
}: UseRealtimeUpdatesProps) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const hallIdsRef = useRef<number[]>([]);

  const fetchHallIds = async () => {
    const { data } = await supabase
      .from("halls")
      .select("id")
      .eq("owner_id", Number(userId));

    hallIdsRef.current = data?.map((h) => h.id) || [];
  };

  const fetchNotificationCount = async () => {
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", Number(userId))
      .eq("is_read", false);

    onNotificationsChange(count || 0);
  };

  const fetchBookingCount = async () => {
    let query = supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);

    if (userRole === "owner") {
      // Owner: bookings for their halls
      query = query.in(
        "hall_id",
        hallIdsRef.current.length > 0 ? hallIdsRef.current : [0],
      );
    } else {
      // Customer: their own bookings
      query = query.eq("customer_id", Number(userId));
    }

    const { count } = await query;
    onBookingsChange(count || 0);
  };

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      let isActive = true;

      const setupRealtime = async () => {
        // Clean up existing channel
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
          channelRef.current = null;
          await new Promise((r) => setTimeout(r, 50));
        }

        if (!isActive) return;

        // Fetch hall IDs only for owners
        if (userRole === "owner") {
          await fetchHallIds();
        }

        if (!isActive) return;

        const channel = supabase.channel(`user-updates-${userId}`);

        // Notifications listener (same for both roles)
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

        // Bookings listener
        channel.on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
          },
          (payload: any) => {
            if (userRole === "owner") {
              // Owner: check if booking belongs to their halls
              const hallId = payload.new?.hall_id || payload.old?.hall_id;
              if (hallIdsRef.current.includes(hallId)) {
                fetchBookingCount();
              }
            } else {
              // Customer: check if booking belongs to them
              const customerId =
                payload.new?.customer_id || payload.old?.customer_id;
              if (customerId === Number(userId)) {
                fetchBookingCount();
              }
            }
          },
        );

        channel.subscribe();
        channelRef.current = channel;

        // Initial fetch
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
    }, [userId, userRole]),
  );
};
