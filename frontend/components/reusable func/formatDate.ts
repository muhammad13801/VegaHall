export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
