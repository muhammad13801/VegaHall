export const handleErrorChange =
  (setForm: any) => (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };
