import axios from 'axios';
import { createApiClient } from './apiConfig';
import { createStorageHelper } from './storageHelper';

// Create instances
const storageHelper = createStorageHelper();
const apiClient = createApiClient(import.meta.env.VITE_API_BASE_URL, { axios });
const api = apiClient.getInstance();

// Set up dependencies
storageHelper.setDependencies({ api });
apiClient.setDependencies({ storageHelper });

// Export initialized instances
export { api as default };
export { storageHelper };
