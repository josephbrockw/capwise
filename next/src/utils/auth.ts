import config from '@/config';
import * as authAPI from '@/api/auth';
import type { User } from '@/api/auth';

// Re-export User type
export type { User };

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(config.auth.tokenKey, token);
    // Also set as cookie for server-side proxy access
    document.cookie = `authToken=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  }
}

export function setRefreshToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', token);
    // Also set as cookie
    document.cookie = `refreshToken=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(config.auth.tokenKey);
  }
  return null;
}

export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem('refreshToken');
    // Also remove cookies
    document.cookie = 'authToken=; path=/; max-age=0';
    document.cookie = 'refreshToken=; path=/; max-age=0';
  }
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

const TEAM_ID_STORAGE_KEY = 'capwise_current_team_id';

/**
 * Login user with email and password
 */
export async function login(email: string, password: string, rememberMe: boolean = false): Promise<User> {
  try {
    const response = await authAPI.login({ 'username': email, 'password': password, 'remember_me': rememberMe });

    // Store tokens
    setAuthToken(response.access);
    setRefreshToken(response.refresh);

    // Set selected team: use default_team if available, otherwise first team in list
    if (response.teams && response.teams.length > 0) {
      const selectedTeamId = response.default_team ?? response.teams[0].id;
      localStorage.setItem(TEAM_ID_STORAGE_KEY, selectedTeamId);
    }

    return response.user;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    throw new Error(message);
  }
}

/**
 * Register a new user
 */
export async function register(email: string, password: string, name: string): Promise<User> {
  try {
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    const response = await authAPI.signUp({
      email,
      password1: password,
      password2: password,
      first_name: firstName,
      last_name: lastName || undefined,
    });

    // Note: User needs to verify email before they can login
    // Return a user object for consistency
    return response.user;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    throw new Error(message);
  }
}

/**
 * Logout user
 */
export async function logout() {
  try {
    await authAPI.logout();
  } catch {
    // Continue with logout even if API call fails
    // Silent fail - token will be removed regardless
  } finally {
    removeAuthToken();
    localStorage.removeItem(TEAM_ID_STORAGE_KEY);
  }
}

/**
 * Get current user information
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    return await authAPI.getCurrentUser();
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}
