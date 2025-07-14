const API_BASE_URL = 'http://localhost:8080';

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}

// Add similar functions for other API calls (register, logout, create group, etc.)