/**
 * API Client for Ezaary Backend
 * Handles all communication with Django REST API
 */

const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

// Helper function to create headers
const createHeaders = (includeAuth = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
  }

  return headers;
};

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      error = { detail: `HTTP ${response.status}: ${response.statusText}` };
    }
    console.error("API Error Response:", {
      status: response.status,
      statusText: response.statusText,
      error: error
    }); // Enhanced debug logging
    const errorMessage = error.detail || error.message || (typeof error === 'string' ? error : JSON.stringify(error)) || `HTTP ${response.status}`;
    throw new Error(errorMessage);
  }
  return response.json();
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const auth = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/login/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ token: string; user: any }>(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/logout/`, {
      method: 'POST',
      headers: createHeaders(true),
    });
    return handleResponse<{ message: string }>(response);
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/profile/`, {
      headers: createHeaders(true),
    });
    return handleResponse<any>(response);
  },
};

// ============================================================================
// CATEGORIES
// ============================================================================

export const categories = {
  list: async () => {
    const response = await fetch(`${API_BASE_URL}/categories/`, {
      headers: createHeaders(),
    });
    const data = await handleResponse<any>(response);
    return data.results || data;
  },

  get: async (slug: string) => {
    const response = await fetch(`${API_BASE_URL}/categories/${slug}/`, {
      headers: createHeaders(),
    });
    return handleResponse<any>(response);
  },

  mainCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories/main_categories/`, {
      headers: createHeaders(),
    });
    return handleResponse<any>(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/categories/`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  update: async (slug: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/categories/${slug}/`, {
      method: 'PATCH',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  delete: async (slug: string) => {
    const response = await fetch(`${API_BASE_URL}/categories/${slug}/`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    return handleResponse<void>(response);
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/categories/upload_image/`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse<{ url: string }>(response);
  },
};

// ============================================================================
// SEARCH
// ============================================================================

export const search = {
  query: async (query: string, limit: number = 20, offset: number = 0) => {
    const response = await fetch(
      `${API_BASE_URL}/search/search/?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`,
      {
        headers: createHeaders(),
      }
    );
    return handleResponse<any>(response);
  },
};

// ============================================================================
// PRODUCTS
// ============================================================================

export const products = {
  list: async (params?: Record<string, string>) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/products/?${queryParams}`, {
      headers: createHeaders(),
    });
    const data = await handleResponse<any>(response);
    return data.results || data;
  },

  get: async (slug: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${slug}/`, {
      headers: createHeaders(),
    });
    return handleResponse<any>(response);
  },

  featured: async () => {
    const response = await fetch(`${API_BASE_URL}/products/featured/`, {
      headers: createHeaders(),
    });
    return handleResponse<any>(response);
  },

  newArrivals: async () => {
    const response = await fetch(`${API_BASE_URL}/products/new_arrivals/`, {
      headers: createHeaders(),
    });
    return handleResponse<any>(response);
  },

  onSale: async () => {
    const response = await fetch(`${API_BASE_URL}/products/on_sale/`, {
      headers: createHeaders(),
    });
    return handleResponse<any>(response);
  },

  related: async (slug: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${slug}/related/`, {
      headers: createHeaders(),
    });
    return handleResponse<any>(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/products/`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  update: async (slug: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/products/${slug}/`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  delete: async (slug: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${slug}/`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    return handleResponse<void>(response);
  },

  reorder: async (products: Array<{ id: string; display_order: number }>) => {
    const response = await fetch(`${API_BASE_URL}/products/reorder/`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({ products }),
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    // Do NOT set Content-Type header manually for FormData
    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/products/upload_image/`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse<{ url: string }>(response);
  },
};

// ============================================================================
// ORDERS
// ============================================================================

export const orders = {
  list: async (params?: Record<string, string>) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/orders/?${queryParams}`, {
      headers: createHeaders(true),
    });
    return handleResponse<any>(response);
  },

  get: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/`, {
      headers: createHeaders(true),
    });
    return handleResponse<any>(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/orders/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  updateStatus: async (id: string, status: string, notes?: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/update_status/`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({ status, notes }),
    });
    return handleResponse<any>(response);
  },

  statistics: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/statistics/`, {
      headers: createHeaders(true),
    });
    return handleResponse<any>(response);
  },
};

// ============================================================================
// REVIEWS
// ============================================================================

export const reviews = {
  list: async (productId?: string) => {
    const params = productId ? `?product=${productId}` : '';
    const response = await fetch(`${API_BASE_URL}/reviews/${params}`, {
      headers: createHeaders(),
    });
    return handleResponse<any>(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/reviews/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  approve: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}/approve/`, {
      method: 'POST',
      headers: createHeaders(true),
    });
    return handleResponse<any>(response);
  },

  markHelpful: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}/mark_helpful/`, {
      method: 'POST',
      headers: createHeaders(),
    });
    return handleResponse<any>(response);
  },
};

// ============================================================================
// SHIPPING
// ============================================================================

export const shipping = {
  zones: async () => {
    const response = await fetch(`${API_BASE_URL}/shipping-zones/`, {
      headers: createHeaders(),
    });
    return handleResponse<any>(response);
  },

  getCost: async (governorate: string) => {
    const response = await fetch(
      `${API_BASE_URL}/shipping-zones/get_shipping_cost/?governorate=${encodeURIComponent(governorate)}`,
      {
        headers: createHeaders(),
      }
    );
    return handleResponse<any>(response);
  },
};

// ============================================================================
// SITE SETTINGS
// ============================================================================

export const settings = {
  list: async () => {
    const response = await fetch(`${API_BASE_URL}/site-settings/`, {
      headers: createHeaders(),
    });
    const data = await handleResponse<any>(response);
    return data.results || data;
  },

  get: async (key: string) => {
    const response = await fetch(`${API_BASE_URL}/site-settings/${key}/`, {
      headers: createHeaders(),
    });
    return handleResponse<any>(response);
  },
};

// ============================================================================
// BANNERS
// ============================================================================

export const banners = {
  list: async () => {
    const response = await fetch(`${API_BASE_URL}/banners/`, {
      headers: createHeaders(),
    });
    return handleResponse<any>(response);
  },
};

// ============================================================================
// COUPONS
// ============================================================================

export const coupons = {
  list: async (params?: Record<string, string>) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/coupons/?${queryParams}`, {
      headers: createHeaders(true),
    });
    const data = await handleResponse<any>(response);
    return data.results || data;
  },

  get: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}/`, {
      headers: createHeaders(true),
    });
    return handleResponse<any>(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/coupons/`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}/`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}/`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    return handleResponse<void>(response);
  },

  validate: async (code: string, productId?: string, amount?: number) => {
    const response = await fetch(`${API_BASE_URL}/coupons/validate/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ code, product_id: productId, amount }),
    });
    return handleResponse<{
      valid: boolean;
      coupon: any;
      discount_percentage: number;
      discount_amount: number;
      final_amount: number;
    }>(response);
  },
};

// Export everything
export default {
  auth,
  categories,
  products,
  orders,
  reviews,
  shipping,
  settings,
  banners,
  coupons,
};




