import { API_BASE_URL } from "../config";

export const markNotificationsAsRead = async (setNotificationsCount: React.Dispatch<React.SetStateAction<number>>) => { // Accept setNotificationsCount as an argument
    try {
        const response = await fetch(`${API_BASE_URL}/api/notification/read`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            console.log('Notifications marked as read successfully');
            fetchUnreadCount(setNotificationsCount); // Pass setNotificationsCount to fetchUnreadCount
        } else {
            console.error('Failed to mark notifications as read');
        }
    } catch (error) {
        console.error('Error marking notifications as read:', error);
    }
};

// Update fetchUnreadCount to accept setNotificationsCount
export const fetchUnreadCount = async (setNotificationsCount: React.Dispatch<React.SetStateAction<number>>) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch unread count');
        }
        const data = await response.json();
        setNotificationsCount(data.unread_count); // Update notifications count
    } catch (error) {
        console.error('Error fetching unread count:', error);
    }
};