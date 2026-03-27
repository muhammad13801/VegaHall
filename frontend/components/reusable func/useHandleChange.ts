import { useCallback } from "react";

export const useHandleChange = (setForm: any) => {
  return useCallback(
    (key: string, value: any) => {
      setForm((prev: any) => ({ ...prev, [key]: value }));
    },
    [setForm],
  );
};
