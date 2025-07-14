import { API_BASE_URL } from '../config';

const getAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };
  }
  return {
    'Content-Type': 'application/json',
  };
};

const getFetchOptions = () => ({
  headers: getAuthHeaders(),
  credentials: 'include' as RequestCredentials,
});

export const getFormFetchOptions = () => {
  return {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`, 
    },
    credentials: 'include' as RequestCredentials, 
  };
};

export const fetchPosts = async () => {
  const response = await fetch(`${API_BASE_URL}/api/posts`, getFormFetchOptions());
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
};

export const fetchPost = async (postId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/post/single?id=${postId}`, getFormFetchOptions());
  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }
  const data = await response.json();
  console.log('Fetched post data:', data); // Add this line
  return data;
};

interface CommentType {
  id: number;
  post_id: number;
  user: {
    id: number;
    username: string;
    avatarUrl: string;
  };
  content: string;
  created_at: string;
}

export const addComment = async (formData: FormData): Promise<CommentType> => {
  const response = await fetch(`${API_BASE_URL}/api/comment`, {
    ...getFormFetchOptions(),
    method: 'POST',
    body: formData, 
  });
  if (!response.ok) {
    throw new Error('Failed to add comment');
  }
  return response.json();
};

// Remove the fetchComments function as it's no longer needed

export const updatePost = async (postId: number, formData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/post/update`, {
    method: 'PUT',
    body: formData,
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to update post');
  }
  return response.json();
};

export const deletePost = async (postId: number): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/api/post/delete?id=${postId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete post');
  }
  
  return response;
};

// Add these new functions
export const createGroupPost = async (formData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/group/post`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to create group post');
  }
  return response.json();
};

export const fetchGroupPosts = async (groupname: string) => {
  const response = await fetch(`${API_BASE_URL}/api/group/posts?groupname=${groupname}`, getFetchOptions());
  if (!response.ok) {
    throw new Error('Failed to fetch group posts');
  }
  return response.json();
};