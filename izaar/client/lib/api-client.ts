/**
 * API Client for Ezaary Backend
 * Handles all communication with Django REST API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ezaary.com/api';

// Helper function to get admin auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

// Helper function to get customer auth token (Bearer)
const getCustomerToken = (): string | null => {
  return localStorage.getItem('ezaary_customer_token');
};

// Helper function to create headers (admin uses Token, customer uses Bearer - separate flows)
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

// Customer auth uses Bearer token
const createCustomerAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = getCustomerToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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
    let errorMessage = '';

    // Handle string error or objects
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      // Priority: Check specific keys first
      const priorityKeys = ['detail', 'message', 'non_field_errors', '__all__'];
      for (const key of priorityKeys) {
        const val = (error as any)[key];
        if (typeof val === 'string') {
          errorMessage = val;
          break;
        } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
          errorMessage = val[0];
          break;
        }
      }

      // Fallback: Check all values for first string/array of strings (like field validation errors)
      if (!errorMessage) {
        for (const key in error) {
          const val = (error as any)[key];
          if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
            errorMessage = val[0]; // Take first error of first field found
            break;
          } else if (typeof val === 'string') {
            errorMessage = val;
            break;
          }
        }
      }

      // Last resort: Stringify
      if (!errorMessage) {
        errorMessage = JSON.stringify(error);
      }
    } else {
      errorMessage = `HTTP ${response.status}`;
    }

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
    // Check if we have a file to upload (payment screenshot)
    if (data.payment_screenshot) {
      // Use FormData for multipart upload
      const formData = new FormData();

      // Add all order fields to FormData
      Object.keys(data).forEach(key => {
        if (key === 'items') {
          // Serialize items as JSON string
          formData.append('items', JSON.stringify(data.items));
        } else if (key === 'payment_screenshot') {
          // Add file directly
          formData.append('payment_screenshot', data.payment_screenshot);
        } else if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key].toString());
        }
      });

      const headers: HeadersInit = {};
      const customerToken = getCustomerToken();
      if (customerToken) headers['Authorization'] = `Bearer ${customerToken}`;
      const response = await fetch(`${API_BASE_URL}/orders/`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return handleResponse<any>(response);
    } else {
      // Use JSON for regular orders without file
      const response = await fetch(`${API_BASE_URL}/orders/`, {
        method: 'POST',
        headers: createCustomerAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<any>(response);
    }
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

  validate: async (code: string, productIds?: string[], amount?: number, items?: any[]) => {
    const response = await fetch(`${API_BASE_URL}/coupons/validate/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ code, product_ids: productIds, amount, items }),
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

// ============================================================================
// PAYMENT NUMBERS
// ============================================================================

export const paymentNumbers = {
  list: async (paymentType?: string) => {
    const params = paymentType ? `?payment_type=${paymentType}` : '';
    const response = await fetch(`${API_BASE_URL}/payment-numbers/${params}`, {
      headers: createHeaders(),
    });
    const data = await handleResponse<any>(response);
    return data.results || data;
  },

  get: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/payment-numbers/${id}/`, {
      headers: createHeaders(),
    });
    return handleResponse<any>(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/payment-numbers/`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/payment-numbers/${id}/`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/payment-numbers/${id}/`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    return handleResponse<void>(response);
  },
};

// ============================================================================
// CUSTOMER AUTHENTICATION
// ============================================================================

export const customerAuth = {
  register: async (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirm: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string }>(response);
  },

  verifyEmail: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email/?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  },

  login: async (email: string, password: string): Promise<{ token: string; customer: any } | { unverified: true; email: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 403 && data.unverified) {
      return { unverified: true as const, email: data.email || email };
    }
    if (!response.ok) {
      const msg = (data.detail || data.message || data.error || 'حدث خطأ') as string;
      throw new Error(typeof msg === 'string' ? msg : String(msg));
    }
    return data as { token: string; customer: any };
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: createCustomerAuthHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      headers: createCustomerAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  updateProfile: async (data: { first_name?: string; last_name?: string; phone?: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: 'PATCH',
      headers: createCustomerAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  changePassword: async (old_password: string, new_password: string, new_password_confirm: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password/`, {
      method: 'POST',
      headers: createCustomerAuthHeaders(),
      body: JSON.stringify({ old_password, new_password, new_password_confirm }),
    });
    return handleResponse<{ message: string }>(response);
  },

  passwordResetRequest: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/password-reset/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ message: string }>(response);
  },

  passwordResetConfirm: async (token: string, new_password: string, new_password_confirm: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/password-reset/confirm/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ token, new_password, new_password_confirm }),
    });
    return handleResponse<{ message: string }>(response);
  },

  resendVerification: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ message: string }>(response);
  },

  getMyOrders: async (params?: { page?: number; status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    const response = await fetch(`${API_BASE_URL}/auth/orders/?${q}`, {
      headers: createCustomerAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  getMyOrder: async (orderNumber: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/orders/${encodeURIComponent(orderNumber)}/`, {
      headers: createCustomerAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  cancelMyOrder: async (orderNumber: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/orders/${encodeURIComponent(orderNumber)}/cancel/`, {
      method: 'POST',
      headers: createCustomerAuthHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  },
};

// Export everything
export default {
  auth,
  customerAuth,
  categories,
  products,
  orders,
  reviews,
  shipping,
  settings,
  banners,
  coupons,
  paymentNumbers,
};




