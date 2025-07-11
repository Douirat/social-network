import { useEffect, useRef } from 'react';

let socket: WebSocket | null = null; // Declare socket variable

export function initWebSocket(clientId: number, onMessage: (message: any) => void): WebSocket {
    // Initialize the WebSocket connection

    socket = new WebSocket(`ws://localhost:8080/ws?userID=${clientId}`);

    socket.onopen = function(event) {
        console.log("WebSocket is open now.");
    };

    socket.onmessage = function(event) {
        try {
            // Split the message by newlines to handle multiple JSON objects
            const messages = event.data.split('\n').filter((msg: string) => msg.trim() !== '');
            messages.forEach((msg: string) => {
                const message = JSON.parse(msg);
                onMessage(message); // Call the provided onMessage function
            });
        } catch (error) {
            console.error("Error parsing WebSocket message:", error);
            console.error("Problematic message:", event.data);
        }
    };

    socket.onclose = function(event) {
        console.log("WebSocket is closed now.");
    };

    socket.onerror = function(error) {
        console.log("WebSocket error:", error);
    };

    return socket; // Return the WebSocket instance
}

export default initWebSocket;