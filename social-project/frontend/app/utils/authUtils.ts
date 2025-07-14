import { API_BASE_URL } from '../config';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string;
  dateOfBirth: string;
  aboutMe: string;
  avatarUrl: string;
  createdAt: string;
  following: number;
  followers: number;
  isFollowed: boolean;
  notifications: number;
}

export const checkAuth = async (): Promise<{ isLoggedIn: boolean; user: User | null }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/check-session`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.isLoggedIn && data.user) {
        // Set default avatar URL if user doesn't have one
        data.user.avatarUrl = data.user.avatarUrl || 'ProfileImage.png';
      }
      return { isLoggedIn: data.isLoggedIn, user: data.user };
    } else {
      console.error('Check session failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return { isLoggedIn: false, user: null };
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    return { isLoggedIn: false, user: null };
  }
};

export const logout = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });

    return response.ok;
  } catch (error) {
    console.error("Error during logout:", error);
    return false;
  }
};

export const login = async (emailOrUsername: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailOrUsername, password }),
      credentials: "include",
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON:", responseText);
      return { success: false, error: "Server returned an invalid response" };
    }

    if (!response.ok) {
      return { success: false, error: data.error || "An error occurred during Login" };
    }

    if (!data.success || !data.user) {
      return { success: false, error: "Invalid response from server" };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error("Error during Login:", error);
    return { success: false, error: "An error occurred during Login. Please try again." };
  }
};

export const signup = async (formData: FormData): Promise<{ success: boolean; error?: string; user?: User }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/signup`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "An error occurred during signup" };
    }

    if (!data.success || !data.user) {
      return { success: false, error: "Invalid response from server" };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error("Error during signup:", error);
    return { success: false, error: "An error occurred during signup. Please try again." };
  }
};
