import axios from 'axios'

const RAW_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
const STRIPPED = (RAW_BASE || '').replace(/\/$/, '')
const API_BASE_URL = STRIPPED.endsWith('/api') ? STRIPPED : `${STRIPPED}/api`

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
})

// Helper to get the auth token from localStorage
const getAuthToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error reading auth token:', error);
    return null;
  }
};

// Add request interceptor to include token with each request
api.interceptors.request.use(
  (config) => {
    // Skip adding auth header for public paths
    const isPublicPath = PUBLIC_PATHS.some(path => 
      config.url.endsWith(path) || 
      config.url.includes(path)
    );

    if (isPublicPath) {
      return config;
    }

    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is not 401 or we've already tried to refresh, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    originalRequest._retry = true;
    
    try {
      // Try to refresh the token
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        const token = await currentUser.getIdToken(true); // Force refresh
        localStorage.setItem('token', token);
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }
      
      // If no current user, redirect to login
      window.location.href = '/login';
      return Promise.reject(error);
    } catch (refreshError) {
      console.error('Failed to refresh token:', refreshError);
      // Clear auth state and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

// Endpoints that must not be gated (public/auth bootstrap)
const PUBLIC_PATHS = [
  '/auth/firebase-login',
  '/auth/metamask/nonce',
  '/auth/metamask/verify'
];

// Simple helper to asynchronously wait for a token to appear in localStorage
async function waitForToken(maxMs = 2000, intervalMs = 100) {
  const start = Date.now()
  
  // Check for token immediately
  const token = getAuthToken()
  if (token) return token

  // If token not found, wait and check again
  while (Date.now() - start < maxMs) {
    await new Promise((r) => setTimeout(r, intervalMs))
    const newToken = getAuthToken()
    if (newToken) return newToken
  }
  
  return null
}

api.interceptors.request.use(async (config) => {
  const hasAuthHeader = !!config.headers?.Authorization
  // Normalize path of the request
  const urlPath = (() => {
    try {
      // If absolute URL, extract pathname; otherwise use config.url
      const u = new URL(config.url, API_BASE_URL)
      return u.pathname
    } catch {
      return config.url || ''
    }
  })()

  const isPublic = PUBLIC_PATHS.some((p) => urlPath?.startsWith(p))

  // Attach existing token immediately if present
  if (!hasAuthHeader) {
    const token = getAuthToken();
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  // If still no header and this is not a public path, gate briefly waiting for token
  if (!hasAuthHeader && !isPublic) {
    const waitedToken = await waitForToken(2000, 100)
    if (waitedToken) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${waitedToken}`
    }
  }

  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Optionally emit a custom event to handle global logout
      window.dispatchEvent(new CustomEvent('bl_unauthorized'))
    }
    return Promise.reject(err)
  }
)

// Blockchain API
export const fundEscrow = async (amount, projectId, clientAddress) => {
  if (!projectId) {
    throw new Error('Project ID is required to fund escrow');
  }
  if (!clientAddress) {
    throw new Error('Client wallet address is required to fund escrow');
  }
  try {
    const response = await api.post("/blockchain/fund", { 
      amount, 
      projectId, 
      clientAddress 
    });
    return response;
  } catch (error) {
    console.error('Error in fundEscrow:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: error.config?.headers
      }
    });
    throw error;
  }
};

export const withdrawEscrow = async (amount) => {
  return api.post("/blockchain/withdraw", { amount });
};

export default api
