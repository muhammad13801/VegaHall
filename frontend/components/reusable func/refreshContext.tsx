import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { AppState } from "react-native";
import api from "../Services/sessionApi";

const RefreshContext = createContext({
  triggerRefresh: () => {},
  refreshKey: 0,
});

const POLL_INTERVAL = 15_000;

export const RefreshProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const lastUpdatedRef = useRef<string | null>(null);
  const appState = useRef(AppState.currentState);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const poll = async () => {
    try {
      const { data } = await api.get("/app-state/last-updated");
      if (
        lastUpdatedRef.current &&
        data.last_updated !== lastUpdatedRef.current
      ) {
        triggerRefresh();
      }

      lastUpdatedRef.current = data.last_updated;
    } catch (err) {
      console.error("Poll error:", err);
    }
  };

  useEffect(() => {
    poll();

    const interval = setInterval(poll, POLL_INTERVAL);

    const appStateSub = AppState.addEventListener("change", (nextState) => {
      if (appState.current === "background" && nextState === "active") {
        poll();
      }
      appState.current = nextState;
    });

    return () => {
      clearInterval(interval);
      appStateSub.remove();
    };
  }, []);

  return (
    <RefreshContext.Provider value={{ triggerRefresh, refreshKey }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => useContext(RefreshContext);
