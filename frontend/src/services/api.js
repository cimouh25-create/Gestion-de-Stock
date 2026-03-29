import { authService } from './authService';

// Use network IP for mobile access, localhost for development
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8000/api'
  : `http://${window.location.hostname}:8000/api`;

const getAuthToken = () => localStorage.getItem('access_token');

// Helper function to handle API requests with token refresh support
const apiRequest = async (endpoint, options = {}) => {
  const { errorMessage = 'Une erreur est survenue', ...customOptions } = options;
  
  const headers = {
    'Content-Type': 'application/json',
    ...customOptions.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData (remove Content-Type to let browser set boundary)
  if (customOptions.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...customOptions,
    headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    let response = await fetch(url, config);

    // If 401 Unauthorized, try to refresh token and retry
    if (response.status === 401) {
      try {
        await authService.refreshToken();
        
        // Retry with new token
        const newToken = getAuthToken();
        if (newToken) {
          config.headers['Authorization'] = `Bearer ${newToken}`;
        }
        response = await fetch(url, config);
      } catch (refreshError) {
        // If refresh fails, logout and redirect
        authService.logout();
        window.location.href = '/sign-in';
        throw new Error('Session expirée');
      }
    }

    if (!response.ok) {
      throw new Error(errorMessage);
    }

    // Return null for 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const clientService = {
  getAll: async (page = 1, search = '') => {
    const params = new URLSearchParams({ page, search });
    return apiRequest(`/clients/?${params}`, { errorMessage: 'Failed to fetch clients' });
  },

  getById: async (id) => {
    return apiRequest(`/clients/${id}/`, { errorMessage: 'Failed to fetch client' });
  },

  create: async (data) => {
    return apiRequest('/clients/', {
      method: 'POST',
      body: JSON.stringify(data),
      errorMessage: 'Failed to create client',
    });
  },

  update: async (id, data) => {
    return apiRequest(`/clients/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
      errorMessage: 'Failed to update client',
    });
  },

  delete: async (id) => {
    return apiRequest(`/clients/${id}/`, {
      method: 'DELETE',
      errorMessage: 'Failed to delete client',
    });
  },
};

export const venteService = {
  getAll: async (page = 1, search = '', statut = '') => {
    const params = new URLSearchParams({ page, search });
    if (statut) params.append('statut', statut);
    return apiRequest(`/ventes/?${params}`, { errorMessage: 'Failed to fetch sales' });
  },

  getById: async (id) => {
    return apiRequest(`/ventes/${id}/`, { errorMessage: 'Failed to fetch sale' });
  },

  create: async (data) => {
    return apiRequest('/ventes/', {
      method: 'POST',
      body: JSON.stringify(data),
      errorMessage: 'Failed to create sale',
    });
  },

  update: async (id, data) => {
    return apiRequest(`/ventes/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
      errorMessage: 'Failed to update sale',
    });
  },

  delete: async (id) => {
    return apiRequest(`/ventes/${id}/`, {
      method: 'DELETE',
      errorMessage: 'Failed to delete sale',
    });
  },

  getStatistics: async (jours = 30) => {
    return apiRequest(`/ventes/statistiques/?jours=${jours}`, { errorMessage: 'Failed to fetch statistics' });
  },

  valider: async (id) => {
    return apiRequest(`/ventes/${id}/valider/`, {
      method: 'POST',
      errorMessage: 'Failed to validate sale',
    });
  },

  annuler: async (id) => {
    return apiRequest(`/ventes/${id}/annuler/`, {
      method: 'POST',
      errorMessage: 'Failed to cancel sale',
    });
  },

  downloadFacture: async (id) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/ventes/${id}/facture/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Impossible de charger la facture');
    return response.text();
  },
};

export const categorieService = {
  getAll: async (page = 1, search = '') => {
    const params = new URLSearchParams({ page, search });
    return apiRequest(`/categories/?${params}`, { errorMessage: 'Failed to fetch categories' });
  },

  getById: async (id) => {
    return apiRequest(`/categories/${id}/`, { errorMessage: 'Failed to fetch category' });
  },

  create: async (data) => {
    return apiRequest('/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
      errorMessage: 'Failed to create category',
    });
  },

  update: async (id, data) => {
    return apiRequest(`/categories/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
      errorMessage: 'Failed to update category',
    });
  },

  delete: async (id) => {
    return apiRequest(`/categories/${id}/`, {
      method: 'DELETE',
      errorMessage: 'Failed to delete category',
    });
  },
};

export const fournisseurService = {
  getAll: async (page = 1, search = '') => {
    const params = new URLSearchParams({ page, search });
    return apiRequest(`/fournisseurs/?${params}`, { errorMessage: 'Failed to fetch suppliers' });
  },

  getById: async (id) => {
    return apiRequest(`/fournisseurs/${id}/`, { errorMessage: 'Failed to fetch supplier' });
  },

  create: async (data) => {
    return apiRequest('/fournisseurs/', {
      method: 'POST',
      body: JSON.stringify(data),
      errorMessage: 'Failed to create supplier',
    });
  },

  update: async (id, data) => {
    return apiRequest(`/fournisseurs/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
      errorMessage: 'Failed to update supplier',
    });
  },

  delete: async (id) => {
    return apiRequest(`/fournisseurs/${id}/`, {
      method: 'DELETE',
      errorMessage: 'Failed to delete supplier',
    });
  },
};

export const produitService = {
  getAll: async (page = 1, search = '', barcode = '') => {
    const params = new URLSearchParams({ page, search });
    if (barcode) params.append('barcode', barcode);
    return apiRequest(`/produits/?${params}`, { errorMessage: 'Failed to fetch products' });
  },

  getById: async (id) => {
    return apiRequest(`/produits/${id}/`, { errorMessage: 'Failed to fetch product' });
  },

  create: async (data) => {
    const isFormData = data instanceof FormData;
    return apiRequest('/produits/', {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
      errorMessage: 'Failed to create product',
    });
  },

  update: async (id, data) => {
    const isFormData = data instanceof FormData;
    return apiRequest(`/produits/${id}/`, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
      errorMessage: 'Failed to update product',
    });
  },

  delete: async (id) => {
    return apiRequest(`/produits/${id}/`, {
      method: 'DELETE',
      errorMessage: 'Failed to delete product',
    });
  },
};

export const achatService = {
  getAll: async (page = 1, search = '', statut = '') => {
    const params = new URLSearchParams({ page, search });
    if (statut) params.append('statut', statut);
    return apiRequest(`/achats/?${params}`, { errorMessage: 'Failed to fetch purchases' });
  },

  getById: async (id) => {
    return apiRequest(`/achats/${id}/`, { errorMessage: 'Failed to fetch purchase' });
  },

  create: async (data) => {
    return apiRequest('/achats/', {
      method: 'POST',
      body: JSON.stringify(data),
      errorMessage: 'Failed to create purchase',
    });
  },

  update: async (id, data) => {
    return apiRequest(`/achats/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
      errorMessage: 'Failed to update purchase',
    });
  },

  delete: async (id) => {
    return apiRequest(`/achats/${id}/`, {
      method: 'DELETE',
      errorMessage: 'Failed to delete purchase',
    });
  },

  ajouterItem: async (id, item) => {
    return apiRequest(`/achats/${id}/ajouter_item/`, {
      method: 'POST',
      body: JSON.stringify(item),
      errorMessage: 'Failed to add item',
    });
  },

  supprimerItem: async (id, itemId) => {
    return apiRequest(`/achats/${id}/supprimer_item/`, {
      method: 'DELETE',
      body: JSON.stringify({ item_id: itemId }),
      errorMessage: 'Failed to delete item',
    });
  },

  confirmer: async (id) => {
    return apiRequest(`/achats/${id}/confirmer/`, {
      method: 'POST',
      errorMessage: 'Failed to confirm purchase',
    });
  },

  recevoir: async (id) => {
    return apiRequest(`/achats/${id}/recevoir/`, {
      method: 'POST',
      errorMessage: 'Failed to receive purchase',
    });
  },

  getStatistics: async () => {
    return apiRequest('/achats/statistiques/', { errorMessage: 'Failed to fetch statistics' });
  },
};
