import { API_BASE_URL } from "../../config";

// Function to fetch events for a specific group
export const fetchEvents = async (groupname: string) => {
    const response = await fetch(`${API_BASE_URL}/api/events?groupname=${groupname}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error("Failed to fetch events");
    }

    return await response.json(); // Return the fetched events
};

// Function to update the user's response to an event
export const updateEventResponse = async (eventID: number, newResponse: string) => {
    const response = await fetch(`${API_BASE_URL}/api/event/respond?eventID=${eventID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ response: newResponse }), // Send the response in the request body
    });

    if (!response.ok) {
        throw new Error('Failed to update response');
    }

    return await response.json(); // Optionally return the response data
};

// Function to create a new event
export const createEvent = async (eventData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/event`, {
        method: 'POST',
        body: JSON.stringify(eventData),
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to create event');
    }
};

// Function to fetch replies for a specific event
export const fetchEventReplies = async (eventID: number) => { 
    const response = await fetch(`${API_BASE_URL}/api/event/responses?eventID=${eventID}`, { 
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error("Failed to fetch replies");
    }

    return await response.json(); // Return the fetched replies
};
