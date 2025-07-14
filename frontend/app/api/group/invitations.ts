import { API_BASE_URL } from "../../config";

export const fetchUsers = async (groupname: string) => {
    const response = await fetch(`${API_BASE_URL}/api/group/invite-list?groupname=${groupname}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error("Error fetching users");
    }
    return response.json();
};

export const inviteUsers = async (userIDs: number[], groupname: string) => { // Accept groupname as a parameter
    const url = `${API_BASE_URL}/api/group/invite?groupname=${groupname}`; 
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userIDs })
    });

    if (!response.ok) {
        throw new Error("Error sending invite");
    }
};

export const cancelInvitation = async (userID: number, groupname: string) => {
    const url = `${API_BASE_URL}/api/group/cancel-invite?groupname=${groupname}`; 
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userID }) // Send userID in the body
    });

    if (!response.ok) {
        throw new Error("Error canceling invite");
    }
};
