import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { offlineAPI } from "./offline-first-api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Enhanced fetch that handles offline mode
async function offlineAwareFetch(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  
  // Check if response indicates offline mode
  const isOfflineMode = res.headers.get('X-Offline-Mode') === 'true';
  
  if (isOfflineMode && res.ok) {
    const data = await res.json();
    console.log('Query: Offline mode detected, using local database');
    
    // Route to appropriate offline method based on URL
    if (url.includes('/api/projects')) {
      const offlineData = await offlineAPI.getProjects(1); // Default company ID
      return new Response(JSON.stringify(offlineData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.includes('/api/dashboard/stats')) {
      const offlineData = await offlineAPI.getDashboardStats(1);
      return new Response(JSON.stringify(offlineData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.includes('/api/users')) {
      const offlineData = await offlineAPI.getUsers(1);
      return new Response(JSON.stringify(offlineData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.includes('/api/transactions')) {
      const offlineData = await offlineAPI.getTransactions(1);
      return new Response(JSON.stringify(offlineData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.includes('/api/equipment')) {
      const offlineData = await offlineAPI.getEquipment(1);
      return new Response(JSON.stringify(offlineData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  return res;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await offlineAwareFetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const res = await offlineAwareFetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});
