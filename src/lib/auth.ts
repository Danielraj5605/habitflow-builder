/**
 * Authentication utilities for HabitFlow
 */

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  return !!token;
};

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const clearAuth = (): void => {
  localStorage.removeItem("token");
};

export const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

/**
 * Check if the current error is an authentication error
 */
export const isAuthError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return message.includes("401") || 
         message.includes("unauthorized") || 
         message.includes("authentication") ||
         message.includes("log in");
};
