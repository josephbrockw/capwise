import { create } from 'zustand';
import { ApiClient } from '../utils/apiConfig';

const api = new ApiClient();

const useProductStore = create((set) => ({
  products: [],
  loading: false,
  error: null,
  selectedProduct: null,
  selectedTier: null,
  selectedPrice: null,

  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.api.get('/api/products');
      set({ products: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setSelectedTier: (tier) => set({ selectedTier: tier }),
  setSelectedPrice: (price) => set({ selectedPrice: price }),

  reset: () => set({
    selectedProduct: null,
    selectedTier: null,
    selectedPrice: null,
  }),
}));

export default useProductStore;
