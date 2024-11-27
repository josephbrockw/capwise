import axios from 'axios';

export class ApiClient {
  constructor(baseURL, deps = { axios }) {
    this.isRefreshing = false;
    this.refreshSubscribers = [];
    this.baseURL = baseURL;
    this.deps = deps;

    this.instance = this.deps.axios.create({
      baseURL: this.baseURL,
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.deps.storageHelper?.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => this.handleResponseError(error)
    );
  }

  async handleResponseError(error) {
    const originalRequest = error.config;

    if (error.response?.data?.error_code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      if (this.isRefreshing) {
        return new Promise((resolve) => {
          this.refreshSubscribers.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(this.deps.axios(originalRequest));
          });
        });
      }

      this.isRefreshing = true;
      originalRequest._retry = true;

      try {
        const response = await this.deps.axios.post(
          `${this.baseURL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = response.data.data.token;

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        this.onTokenRefreshed(newToken);
        return this.deps.axios(originalRequest);
      } catch (refreshError) {
        this.handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }

  onTokenRefreshed(token) {
    this.deps.storageHelper?.setItem('token', token);
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
    this.isRefreshing = false;
  }

  handleLogout() {
    this.deps.storageHelper?.logout();
    window.location.href = '/login';
  }

  getInstance() {
    return this.instance;
  }

  setDependencies(deps) {
    this.deps = { ...this.deps, ...deps };
    this.setupInterceptors();
  }
}

// Export the class only, initialization will be handled elsewhere
export const createApiClient = (baseURL, deps) => new ApiClient(baseURL, deps);
