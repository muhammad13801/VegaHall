import { useState, useEffect, useCallback } from "react";
import { useRefresh } from "./refreshContext";

interface PaginatedFetchOptions {
  fetchFunction: (page: number, limit: number) => Promise<{ data: any[] }>;
  limit?: number; // items per page
}

export const usePaginatedFetch = ({
  fetchFunction,
  limit = 5,
}: PaginatedFetchOptions) => {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { refreshKey } = useRefresh();

  const fetchItems = useCallback(
    async (pageNum = 1, reset = false) => {
      try {
        const { data } = await fetchFunction(pageNum, limit);
        setItems((prev) => (reset ? data : [...prev, ...data]));
        setHasMore(data.length === limit);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [fetchFunction, limit],
  );

  // Initial fetch + global refresh
  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchItems(1, true);
  }, [fetchItems, refreshKey]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchItems(1, true);
  }, [fetchItems]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setLoadingMore(true);
      setPage(nextPage);
      fetchItems(nextPage);
    }
  }, [loadingMore, hasMore, page, fetchItems]);

  return {
    items,
    setItems,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    onRefresh,
    loadMore,
  };
};
