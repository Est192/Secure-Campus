import { QueryCache, QueryClient } from "@tanstack/react-query";
import axios from "axios";

function reportQueryError(error: Error) {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  console.error("SecureCampus API query failed.", { status, message: error.message });
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: reportQueryError,
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error) && error.response && error.response.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
