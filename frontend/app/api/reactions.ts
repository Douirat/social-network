import { API_BASE_URL, getAuthHeaders } from '../config';

let cachedReactions: any[] | null = null;

export const fetchAvailableReactions = async () => {
  if (cachedReactions) {
    return cachedReactions;
  }

  const response = await fetch(`${API_BASE_URL}/api/reactions`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch reactions');
  }
  cachedReactions = await response.json();
  return cachedReactions;
};

export const reactToContent = async (
  contentType: 'post' | 'comment',
  contentId: number,
  reactionTypeId: number
) => {
  const response = await fetch(`${API_BASE_URL}/api/react`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reaction_type_id: reactionTypeId,
      post_id: contentType === 'post' ? contentId : undefined,
      comment_id: contentType === 'comment' ? contentId : undefined,
    }),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to react to content');
  }
  return response.json();
};