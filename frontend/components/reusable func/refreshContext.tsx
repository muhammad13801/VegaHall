import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
const RefreshContext = createContext({
  triggerRefresh: () => {},
  refreshKey: 0,
});

export const RefreshProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  useEffect(() => {
    // Polling removed as per user request to avoid repetitive 500 errors
  }, []);


  return (
    <RefreshContext.Provider value={{ triggerRefresh, refreshKey }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => useContext(RefreshContext);
