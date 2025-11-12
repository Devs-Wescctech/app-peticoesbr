const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class APIClient {
  async request(method, endpoint, { body, params } = {}) {
    let url = `${API_BASE_URL}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          searchParams.append(key, params[key]);
        }
      });
      if (searchParams.toString()) {
        url += '?' + searchParams.toString();
      }
    }
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }
    
    return response.json();
  }
  
  get(endpoint, params) {
    return this.request('GET', endpoint, { params });
  }
  
  post(endpoint, body) {
    return this.request('POST', endpoint, { body });
  }
  
  put(endpoint, body) {
    return this.request('PUT', endpoint, { body });
  }
  
  delete(endpoint) {
    return this.request('DELETE', endpoint);
  }
}

const apiClient = new APIClient();

const createEntity = (endpoint) => ({
  list: (paramsOrOrder) => {
    if (typeof paramsOrOrder === 'string') {
      return apiClient.get(endpoint, { order: paramsOrOrder });
    }
    return apiClient.get(endpoint, paramsOrOrder);
  },
  get: (id) => apiClient.get(`${endpoint}/${id}`),
  getBySlug: (slug) => apiClient.get(`${endpoint}/slug/${slug}`),
  create: (data) => apiClient.post(endpoint, data),
  update: (id, data) => apiClient.put(`${endpoint}/${id}`, data),
  delete: (id) => apiClient.delete(`${endpoint}/${id}`),
});

export const User = createEntity('/users');
export const Petition = createEntity('/petitions');
export const Signature = createEntity('/signatures');
export const Campaign = createEntity('/campaigns');
export const CampaignLog = createEntity('/campaign-logs');
export const MessageTemplate = createEntity('/message-templates');
export const LinkTreePage = createEntity('/linktree-pages');
export const LinkBioPage = createEntity('/linkbio-pages');

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Upload failed');
  }
  
  const result = await response.json();
  return {
    url: result.url,
    path: result.url,
  };
}

export default apiClient;
