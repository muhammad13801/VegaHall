// RefreshContext.tsx
import React, { createContext, useContext, useState } from "react";

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

  return (
    <RefreshContext.Provider value={{ triggerRefresh, refreshKey }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => useContext(RefreshContext);
