import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { offlineAPI, networkManager } from "./offline-api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Enhanced API request function with offline support
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Try offline-first approach for supported endpoints
  const endpoint = url.replace('/api', '');
  
  try {
    let result;
    
    // Handle different HTTP methods with offline fallback
    if (method === 'POST') {
      if (endpoint === '/projects') {
        result = await offlineAPI.createProject(data);
      } else if (endpoint === '/transactions') {
        result = await offlineAPI.createTransaction(data);
      } else if (endpoint === '/users') {
        result = await offlineAPI.createUser(data);
      } else if (endpoint === '/equipment') {
        result = await offlineAPI.createEquipment(data);
      } else if (endpoint === '/intelligence/cost-estimation') {
        result = await offlineAPI.getCostEstimation(data);
      }
    } else if (method === 'PUT') {
      const dataObj = data as any;
      if (endpoint.startsWith('/projects/')) {
        const id = parseInt(endpoint.split('/')[2]);
        result = await offlineAPI.updateProject(id, dataObj);
      } else if (endpoint.startsWith('/transactions/')) {
        const id = parseInt(endpoint.split('/')[2]);
        result = await offlineAPI.updateTransaction(id, dataObj);
      } else if (endpoint.startsWith('/users/')) {
        const id = parseInt(endpoint.split('/')[2]);
        result = await offlineAPI.updateUser(id, dataObj);
      } else if (endpoint.startsWith('/equipment/')) {
        const id = parseInt(endpoint.split('/')[2]);
        result = await offlineAPI.updateEquipment(id, dataObj);
      }
    } else if (method === 'DELETE') {
      if (endpoint.startsWith('/projects/')) {
        const id = parseInt(endpoint.split('/')[2]);
        result = await offlineAPI.deleteProject(id);
      }
    }
    
    if (result !== undefined) {
      // Create a mock Response object for compatibility
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.warn('Offline API failed, falling back to network:', error);
  }
  
  // Fallback to traditional network request
  const res = await fetch(url, {
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
    const endpoint = url.replace('/api', '');
    
    try {
      // Try offline-first approach for GET requests
      const urlParts = endpoint.split('?');
      const path = urlParts[0];
      const searchParams = new URLSearchParams(urlParts[1] || '');
      const companyId = parseInt(searchParams.get('companyId') || '1');
      
      let result;
      
      if (path === '/projects') {
        result = await offlineAPI.getProjects(companyId);
      } else if (path.startsWith('/projects/') && path.split('/').length === 3) {
        const id = parseInt(path.split('/')[2]);
        result = await offlineAPI.getProject(id);
      } else if (path === '/transactions') {
        result = await offlineAPI.getTransactions(companyId);
      } else if (path === '/users') {
        result = await offlineAPI.getUsers(companyId);
      } else if (path === '/equipment') {
        result = await offlineAPI.getEquipment(companyId);
      } else if (path === '/companies') {
        result = await offlineAPI.getCompanies();
      } else if (path === '/warehouses') {
        result = await offlineAPI.getWarehouses(companyId);
      } else if (path === '/dashboard/stats') {
        result = await offlineAPI.getDashboardStats(companyId);
      } else if (path === '/intelligence/financial-trends') {
        result = await offlineAPI.getFinancialTrends(companyId);
      }
      
      if (result !== undefined) {
        return result;
      }
    } catch (error) {
      console.warn('Offline query failed, falling back to network:', error);
    }
    
    // Fallback to traditional fetch
    const res = await fetch(url, {
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
      staleTime: 5 * 60 * 1000, // 5 minutes for better offline experience
      retry: (failureCount, error) => {
        // Don't retry if offline
        if (!networkManager.getStatus()) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations if offline
        if (!networkManager.getStatus()) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});
