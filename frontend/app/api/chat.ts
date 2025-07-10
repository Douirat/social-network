import { json } from 'stream/consumers';
import { API_BASE_URL, getAuthHeaders } from '../config';
import { ChatMessage } from '../home/DM/Chat/chatList';

export const fetchAllChats = async () => {
  const response = await fetch(`${API_BASE_URL}/api/chats`, {
    headers: getAuthHeaders(),
    credentials: 'include' as RequestCredentials,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch chats');
  }
  return await response.json();
};

export const fetchChat = async (userBName: string) => {
  const response = await fetch(`${API_BASE_URL}/api/chat?userBName=${userBName}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch chats');
  }
  return await response.json();
};

export const fetchGroupChat = async (groupId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/chat-group?groupId=${groupId}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch chats');
  }
  return await response.json();
};

export const sendMessageChat = async (chatMsg: ChatMessage) => {
  const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
    headers: getAuthHeaders(),
    method: 'POST',
    body: JSON.stringify(chatMsg),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to send message ');
  }
  return response.json();
};

export const fetchNewUsersChat = async () => {
  const response = await fetch(`${API_BASE_URL}/api/chat/newusers`, {
    headers: getAuthHeaders(),
    credentials: 'include' as RequestCredentials,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch chats');
  }
  return await response.json();
};

export const markChatAsRead = async (userBName: string) => {
  const response = await fetch(`${API_BASE_URL}/api/chat/mark-read?userBName=${userBName}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch chats');
  }
};

export const markGroupChatAsRead = async (groupId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/chat/mark-read?groupId=${groupId}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch chats');
  }
};

//export const checkAllowChat = async (userBName: string) => {
//  const response = await fetch(`${API_BASE_URL}/api/chat/allow-chat?userBName=${userBName}`, {
//    headers: getAuthHeaders(),
//    credentials: 'include',
//  });
//  if (!response.ok) {
//    throw new Error('Failed to fetch chats');
//  }
//  return await response.json();
//};
