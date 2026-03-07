const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const API_BASE_URL = API_BASE; // Define API_BASE_URL for fetch calls

export async function fetchWithAuth(url: string, options?: RequestInit) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options?.headers,
  };
  
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    // Token is invalid or expired
    localStorage.removeItem("token");
    throw new Error("Authentication expired. Please log in again.");
  }
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

export async function register(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error(`Registration failed: ${response.status}`);
  }
  return response.json();
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }
  const data = await response.json();
  // ✅ Store token in localStorage
  localStorage.setItem("token", data.access_token);
  return data;
}

export async function getHabits() {
  const response = await fetchWithAuth(`${API_BASE_URL}/habits`);
  return response;
}

export async function addHabit(habit: any) {
  const response = await fetchWithAuth(`${API_BASE_URL}/habits`, {
    method: "POST",
    body: JSON.stringify(habit),
  });
  return response;
}

export async function deleteHabit(id: string) {
  const response = await fetchWithAuth(`${API_BASE_URL}/habits/${id}`, {
    method: "DELETE",
  });
  return response;
}

export const logHabitCompletion = async (habitId: string, completedDate: string) => {
  return fetchWithAuth(`${API_BASE_URL}/habits/${habitId}/logs`, {
    method: "POST",
    body: JSON.stringify({ habit_id: parseInt(habitId), completed_date: completedDate }),
  });
};

export const deleteHabitLog = async (habitId: string, completedDate: string) => {
  return fetchWithAuth(`${API_BASE_URL}/habits/${habitId}/logs/by-date?completed_date=${encodeURIComponent(completedDate)}`, {
    method: "DELETE"
  });
};

interface HabitUpdate {
  name?: string;
  description?: string;
  frequency?: string;
  weekly_goal?: number;
  is_active?: boolean;
  tags?: string[];
  icon?: string;
  currentWeek?: boolean[];
  streak?: number;
  consistency_score?: number;
}

export const updateHabit = async (id: string, updates: Partial<HabitUpdate>) => {
  return fetchWithAuth(`${API_BASE_URL}/habits/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
};

export async function getMe() {
  return fetchWithAuth(`${API_BASE_URL}/users/me`);
}

export async function updateUserProfile(userData: { name?: string, profile_photo_url?: string }) {
  return fetchWithAuth(`${API_BASE_URL}/users/me`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
}

export async function uploadProfilePhoto(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }

  const response = await fetch(`${API_BASE_URL}/users/me/photo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to upload profile photo");
  }

  return response.json();
}