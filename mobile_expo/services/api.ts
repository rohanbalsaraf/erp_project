import { Platform } from 'react-native';

// Dynamically handle localhost testing based on mobile OS
// Replace this with your actual local IP (e.g., 'http://192.168.1.5:8000') if testing on a physical scanner!
const DEV_URL = Platform.OS === 'android' ? 'http://192.168.0.104:8000/api' : 'http://192.168.0.104:8000/api';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEV_URL;

class ApiService {
  private async getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // In actual implementation, we'll pull from AuthContext/AsyncStorage
    // For now, this service will be fed the token by the Context when required.
    return headers;
  }

  async get(endpoint: string, token?: string) {
    const headers = await this.getHeaders();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async post(endpoint: string, data: any, token?: string) {
    const headers = await this.getHeaders();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  private async handleResponse(response: Response) {
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }

    if (!response.ok) {
      throw { status: response.status, data };
    }
    return { status: response.status, data };
  }
}

export default new ApiService();
