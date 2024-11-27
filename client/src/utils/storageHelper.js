export class StorageHelper {
  constructor(deps = { localStorage: window.localStorage }) {
    this.deps = deps;
  }

  setItem(key, value) {
    // Only stringify if the value is an object
    const item = typeof value === 'object' ? JSON.stringify(value) : value;
    this.deps.localStorage.setItem(key, item);
  }

  getItem(key) {
    const item = this.deps.localStorage.getItem(key);

    // Only parse if the item appears to be JSON (e.g., starts with '{' or '[')
    if (item && (item.startsWith('{') || item.startsWith('['))) {
      return JSON.parse(item);
    }
    return item; // Return as a string for non-JSON items
  }

  async getUserData() {
    const accessToken = this.getItem('token');
    const userData = this.getItem('userData');

    if (accessToken && !userData && this.deps.api) {
      try {
        const response = await this.deps.api.get('/api/users/me');
        const user = response.data.data;
        this.setItem('userData', user);
        return user;
      } catch(error) {
        console.error('Error fetching user data:', error);
        return null;
      }
    }
    return userData;
  }

  removeData(key) {
    this.deps.localStorage.removeItem(key);
  }

  logout() {
    this.removeData('token');
    this.removeData('userData');
  }

  setDependencies(deps) {
    this.deps = { ...this.deps, ...deps };
  }
}

// Export the factory function
export const createStorageHelper = (deps) => new StorageHelper(deps);
