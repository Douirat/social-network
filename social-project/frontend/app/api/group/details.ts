import { API_BASE_URL } from "../../config";

// Function to fetch group details
export const fetchGroupDetails = async (groupname: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/group?groupname=${encodeURIComponent(groupname)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                status: response.status,
                message: data.error || "Failed to fetch group details",
            };
        }

        // Handle different statuses based on the response
        if (data.message) {
            return {
                status: response.status,
                message: data.message,
            };
        } else {
            return {
                status: response.status,
                group: data,
            };
        }
    } catch (error) {
        console.error("Error fetching group details:", error);
        throw error;
    }
};

// New function to fetch all groups
export const fetchGroups = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/groups`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', 
        });

        if (!response.ok) {
            throw new Error("Failed to fetch groups");
        }

        return await response.json(); // Return the fetched groups data
    } catch (error) {
        console.error("Error fetching groups:", error);
        throw error; // Rethrow the error for handling in the component
    }
};

export const deleteGroup = async (groupname: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/group/delete?groupname=${groupname}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include credentials if needed
        });

        // Log the response status and content type
        console.log('Response Status:', response.status);
        console.log('Response Content-Type:', response.headers.get('Content-Type'));

        // Check if the response is OK
        if (!response.ok) {
            // Attempt to parse the response body
            const text = await response.text(); // Get the response as text
            console.error('Response Body:', text); // Log the response body for debugging

            // Try to parse the response as JSON
            try {
                const errorData = JSON.parse(text);
                if (errorData.error) {
                    throw new Error(errorData.error); // Throw the specific error message
                } else {
                    throw new Error("Failed to delete group"); // Generic error message
                }
            } catch (jsonError) {
                throw new Error("Failed to delete group: " + text); 
            }
        }

    } catch (error) {
        console.error("Error deleting group:", error);
        throw error; // Rethrow the error for handling in the component
    }
};

// Function to update group details
export const updateGroup = async (groupData: {
    id: number;
    title: string;
    description: string;
    image: File | null; 
    removedMembers: number[]; // New field for removed member IDs
}) => {
    try {
        const formData = new FormData();
        formData.append("id", groupData.id.toString());
        formData.append("title", groupData.title);
        formData.append("description", groupData.description);
        if (groupData.image) {
            formData.append("image", groupData.image); // Append the image file if it exists
        }
        groupData.removedMembers.forEach(memberId => {
            formData.append("removedMembers[]", memberId.toString()); // Append each removed member ID
        });

        const response = await fetch(`${API_BASE_URL}/api/group/update`, {
            method: 'POST',
            body: formData,
            credentials: 'include', // Include credentials if needed
        });

        if (!response.ok) {
            throw new Error("Failed to update group");
        }

        return await response.json(); // Return the response data
    } catch (error) {
        console.error("Error updating group:", error);
        throw error; // Rethrow the error for handling in the component
    }
};

export const getGroupDetails = async (groupname: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/group/details?groupname=${encodeURIComponent(groupname)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                status: response.status,
                message: data.error || "Failed to fetch group details",
            };
        }

        return {
            status: response.status,
            group: data,
        };
    } catch (error) {
        console.error("Error fetching group details:", error);
        throw error;
    }
};
