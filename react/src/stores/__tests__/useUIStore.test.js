import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../useUIStore';

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store state
    useUIStore.setState({
      sidebarOpen: true,
      toasts: []
    });
  });

  it('should initialize with default values', () => {
    const state = useUIStore.getState();
    expect(state.sidebarOpen).toBe(true);
    expect(state.toasts).toEqual([]);
  });

  it('should toggle sidebar', () => {
    expect(useUIStore.getState().sidebarOpen).toBe(true);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('should add toast', () => {
    expect(useUIStore.getState().toasts).toHaveLength(0);
    useUIStore.getState().addToast('Test message', 'success');

    const toasts = useUIStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({
      message: 'Test message',
      type: 'success'
    });
  });

  it('should remove toast', () => {
    useUIStore.getState().addToast('Test message', 'success');
    const toastId = useUIStore.getState().toasts[0].id;

    expect(useUIStore.getState().toasts).toHaveLength(1);
    useUIStore.getState().removeToast(toastId);
    expect(useUIStore.getState().toasts).toHaveLength(0);
  });

  it('should handle multiple toasts', () => {
    useUIStore.getState().addToast('Success message', 'success');
    useUIStore.getState().addToast('Error message', 'error');
    useUIStore.getState().addToast('Info message', 'info');

    const toasts = useUIStore.getState().toasts;
    expect(toasts).toHaveLength(3);
    expect(toasts[0].type).toBe('success');
    expect(toasts[1].type).toBe('error');
    expect(toasts[2].type).toBe('info');
  });

  it('should maintain toast order', () => {
    useUIStore.getState().addToast('First message', 'success');
    useUIStore.getState().addToast('Second message', 'info');

    const toasts = useUIStore.getState().toasts;
    expect(toasts[0].message).toBe('First message');
    expect(toasts[1].message).toBe('Second message');
  });
});
