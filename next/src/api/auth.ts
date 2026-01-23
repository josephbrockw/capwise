import config from '@/config';
import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export interface SignUpRequest {
  email: string;
  password1: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

export interface SignUpResponse {
  user: User;
  message: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginTeam {
  id: string;
  name: string;
  league_id: string;
  league_name: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
  teams: LoginTeam[];
  default_team: string | null;
}

export interface VerifyEmailRequest {
  token: string;
  email?: string;
  test?: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  password: string;
  password_confirm: string;
}

/**
 * Sign up a new user
 */
export async function signUp(data: SignUpRequest): Promise<SignUpResponse> {
  return apiClient.post<SignUpResponse>(config.api.routes.auth.register, data);
}

/**
 * Log in a user
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>(config.api.routes.auth.login, data);
}

/**
 * Log out a user (requires authentication)
 */
export async function logout(): Promise<void> {
  return apiClient.post<void>(config.api.routes.auth.logout, undefined, true);
}

/**
 * Verify email address
 */
export async function verifyEmail(data: VerifyEmailRequest): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(config.api.routes.auth.verify, data);
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(config.api.routes.auth.resendVerify, { email });
}

/**
 * Request password reset
 */
export async function requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(config.api.routes.auth.passwordReset, data);
}

/**
 * Confirm password reset
 */
export async function confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(config.api.routes.auth.passwordResetConfirm, data);
}

/**
 * Get current user info (requires authentication)
 */
export async function getCurrentUser(): Promise<User> {
  return apiClient.get<User>(config.api.routes.user.info, true);
}

/**
 * Update current user info (requires authentication)
 */
export async function updateUser(data: Partial<Pick<User, 'first_name' | 'last_name'>>): Promise<User> {
  return apiClient.patch<User>(config.api.routes.user.info, data, true);
}

/**
 * Change password for current user (requires authentication)
 */
export async function changePassword(data: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}): Promise<void> {
  return apiClient.post<void>(config.api.routes.user.changePassword, data, true);
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<{ access: string }> {
  return apiClient.post<{ access: string }>(config.api.routes.auth.tokenRefresh, {
    refresh: refreshToken,
  });
}
