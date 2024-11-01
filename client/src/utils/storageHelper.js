import axios from 'axios';

class StorageHelper {
  setItem(key, value) {
    // Only stringify if the value is an object
    const item = typeof value === 'object' ? JSON.stringify(value) : value;
    localStorage.setItem(key, item);
  }

  getItem(key) {
    const item = localStorage.getItem(key);

    // Only parse if the item appears to be JSON (e.g., starts with '{' or '[')
    if (item && (item.startsWith('{') || item.startsWith('['))) {
      return JSON.parse(item);
    }
    return item; // Return as a string for non-JSON items
  }

  async getUserData() {
    const accessToken = this.getItem('token');
    const userData = this.getItem('userData');

    if (accessToken && !userData) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/users/me`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
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
    localStorage.removeItem(key);
  }

  logout() {
    this.removeData('token');
    this.removeData('userData');
  }
}

const storageHelper = new StorageHelper();
export default storageHelper;
