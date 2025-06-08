const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

// Auth API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  register: async (userData: {
    email: string;
    password: string;
    role: 'customer' | 'producer';
    firstName?: string;
    lastName?: string;
    shopName?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Products API calls
export const productsAPI = {
  getAll: async (filters?: {
    category?: string;
    producer?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.producer) params.append('producer', filters.producer);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await fetch(`${API_BASE_URL}/products?${params}`);
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return handleResponse(response);
  },

  getMyProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/products/my-products`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  create: async (productData: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    unit: string;
    images?: string[];
    shopId: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },

  update: async (id: string, productData: Partial<{
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    unit: string;
    images: string[];
    isActive: boolean;
  }>) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Alias for compatibility
  getProducts: async (filters?: {
    category?: string;
    producer?: string;
    search?: string;
  }) => {
    return productsAPI.getAll(filters);
  }
};

// Producers API calls
export const producersAPI = {
  getAll: async (search?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const response = await fetch(`${API_BASE_URL}/producers?${params}`);
    return handleResponse(response);
  },
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/producers/${id}`);
    return handleResponse(response);
  },

  create: async (producerData: {
    shopName: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    specialties: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/producers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(producerData)
    });
    return handleResponse(response);
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/users/producer/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData: {
    shopName?: string;
    description?: string;
    address?: string;
    certifications?: string[];
    pickupInfo?: {
      location: string;
      hours: string;
      instructions: string;
    };
  }) => {
    const response = await fetch(`${API_BASE_URL}/users/producer/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(response);  },
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/users/producer/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getInformation: async () => {
    const response = await fetch(`${API_BASE_URL}/users/producer/information`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateInformation: async (informationData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    businessName?: string;
    businessType?: string;
    siretNumber?: string;
    vatNumber?: string;
    businessAddress?: string;
    farmName?: string;
    farmDescription?: string;
    farmSize?: string;
    productionMethods?: string[];
    certifications?: string[];
    contactHours?: string;
    websiteUrl?: string;
    socialMedia?: {
      facebook: string;
      instagram: string;
      twitter: string;
    };
  }) => {
    const response = await fetch(`${API_BASE_URL}/users/producer/information`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(informationData)
    });
    return handleResponse(response);
  },  // Alias for compatibility
  getPublicProducers: async (search?: string) => {
    const response = await producersAPI.getAll(search);
    // Backend returns { producers: [...], pagination: {...} } but frontend expects direct array
    return response?.producers || response || [];
  }
};

// Customer API calls
export const customerAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/users/customer/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    email?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/users/customer/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(response);
  },

  getPreferences: async () => {
    const response = await fetch(`${API_BASE_URL}/users/customer/preferences`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  updatePreferences: async (preferences: {
    notifications?: boolean;
    newsletter?: boolean;
    sms?: boolean;
    emailPromotions?: boolean;
    favoriteCategories?: string[];
  }) => {
    const response = await fetch(`${API_BASE_URL}/users/customer/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ preferences })
    });
    return handleResponse(response);
  },

  // Payment Methods
  getPaymentMethods: async () => {
    const response = await fetch(`${API_BASE_URL}/users/customer/payment-methods`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  addPaymentMethod: async (paymentMethodData: {
    type: string;
    cardLastFour: string;
    cardBrand: string;
    expiryMonth: string;
    holderName?: string;
    isDefault?: boolean;
    stripePaymentMethodId?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/users/customer/payment-methods`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentMethodData)
    });
    return handleResponse(response);
  },

  updatePaymentMethod: async (id: string, updateData: {
    isDefault?: boolean;
    holderName?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/users/customer/payment-methods/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    return handleResponse(response);
  },

  deletePaymentMethod: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/customer/payment-methods/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Something went wrong');
    }
  },

  // Addresses
  getAddresses: async () => {
    const response = await fetch(`${API_BASE_URL}/users/customer/addresses`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  addAddress: async (addressData: {
    type: string;
    street: string;
    street2?: string;
    city: string;
    postalCode: string;
    country?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    isDefault?: boolean;
  }) => {
    const response = await fetch(`${API_BASE_URL}/users/customer/addresses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(addressData)
    });
    return handleResponse(response);
  },

  updateAddress: async (id: string, updateData: {
    type?: string;
    street?: string;
    street2?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    isDefault?: boolean;
  }) => {
    const response = await fetch(`${API_BASE_URL}/users/customer/addresses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    return handleResponse(response);
  },

  deleteAddress: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/customer/addresses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Something went wrong');
    }
  }
};

// Orders API calls
export const ordersAPI = {
  getCustomerOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/customer`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getProducerOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/producer`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  create: async (orderData: {
    producerId: string;
    items: {
      productId: string;
      quantity: number;
    }[];
    pickupDate?: string;
    pickupPoint?: string;
    notes?: string;
    paymentMethodId?: string;
    paymentIntentId?: string;
    paymentStatus?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    return handleResponse(response);
  },

  updateStatus: async (orderId: string, status: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/producer/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Shops API calls
export const shopsAPI = {
  getMyShops: async () => {
    const response = await fetch(`${API_BASE_URL}/shops/my-shops`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/shops`);
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/shops/${id}`);
    return handleResponse(response);
  },

  create: async (shopData: {
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    specialties: string[];
    images?: string[];
    certifications?: string[];
    pickupInfo?: {
      location: string;
      hours: string;
      instructions: string;
    };
  }) => {
    const response = await fetch(`${API_BASE_URL}/shops`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(shopData)
    });
    return handleResponse(response);
  },

  update: async (id: string, shopData: Partial<{
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    specialties: string[];
    images: string[];
    certifications: string[];
    pickupInfo: {
      location: string;
      hours: string;
      instructions: string;
    };
    isActive: boolean;
  }>) => {
    const response = await fetch(`${API_BASE_URL}/shops/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(shopData)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/shops/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Unified API export for easier importing
export const api = {
  auth: authAPI,
  products: productsAPI,
  producers: producersAPI,
  customers: customerAPI,
  orders: ordersAPI,
  shops: shopsAPI
};
