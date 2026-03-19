// Use network IP for mobile access, localhost for development
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8000/api'
  : `http://${window.location.hostname}:8000/api`;

const getAuthToken = () => localStorage.getItem('access_token');

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const clientService = {
  getAll: async (page = 1, search = '') => {
    const params = new URLSearchParams({ page, search });
    const response = await fetch(`${API_BASE_URL}/clients/?${params}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch clients');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}/`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch client');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/clients/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create client');
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update client');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete client');
  },
};

export const venteService = {
  getAll: async (page = 1, search = '', statut = '') => {
    const params = new URLSearchParams({ page, search });
    if (statut) params.append('statut', statut);
    const response = await fetch(`${API_BASE_URL}/ventes/?${params}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch sales');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ventes/${id}/`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch sale');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/ventes/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create sale');
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/ventes/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update sale');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ventes/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete sale');
  },

  getStatistics: async (jours = 30) => {
    const response = await fetch(`${API_BASE_URL}/ventes/statistiques/?jours=${jours}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return response.json();
  },

  valider: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ventes/${id}/valider/`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to validate sale');
    return response.json();
  },

  livrer: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ventes/${id}/livrer/`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to deliver sale');
    return response.json();
  },

  annuler: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ventes/${id}/annuler/`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to cancel sale');
    return response.json();
  },
};

export const categorieService = {
  getAll: async (page = 1, search = '') => {
    const params = new URLSearchParams({ page, search });
    const response = await fetch(`${API_BASE_URL}/categories/?${params}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}/`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch category');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/categories/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete category');
  },
};

export const fournisseurService = {
  getAll: async (page = 1, search = '') => {
    const params = new URLSearchParams({ page, search });
    const response = await fetch(`${API_BASE_URL}/fournisseurs/?${params}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch suppliers');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/fournisseurs/${id}/`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch supplier');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/fournisseurs/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create supplier');
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/fournisseurs/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update supplier');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/fournisseurs/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete supplier');
  },
};

export const produitService = {
  getAll: async (page = 1, search = '') => {
    const params = new URLSearchParams({ page, search });
    const response = await fetch(`${API_BASE_URL}/produits/?${params}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/produits/${id}/`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  create: async (data) => {
    const headers = getHeaders();
    const isFormData = data instanceof FormData;
    if (isFormData) {
      delete headers['Content-Type'];
    }
    const response = await fetch(`${API_BASE_URL}/produits/`, {
      method: 'POST',
      headers: isFormData ? { Authorization: headers.Authorization } : headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },

  update: async (id, data) => {
    const headers = getHeaders();
    const isFormData = data instanceof FormData;
    if (isFormData) {
      delete headers['Content-Type'];
    }
    const response = await fetch(`${API_BASE_URL}/produits/${id}/`, {
      method: 'PUT',
      headers: isFormData ? { Authorization: headers.Authorization } : headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/produits/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete product');
  },
};
