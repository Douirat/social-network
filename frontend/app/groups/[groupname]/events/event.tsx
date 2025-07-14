import React, { useState } from "react";
import styles from "../Styles/event.module.css";
import styles2 from "../../../components/Style/post.module.css";
import ProfileImage from "../../../../../backend/pkg/db/uploads/ProfileImage.png";
import RepliesWindow from "./repliesWindow"
import { updateEventResponse } from "../../../api/group/events";
import { API_BASE_URL } from '../../../config';
import { fetchEventReplies } from "../../../api/group/events";

// Define the EventProps interface
interface EventProps {
    event: {
        id: number;
        title: string;
        description: string;
        event_date: string;
        created_at: string;
        creator: {
            id: number;
            username: string;
            avatarUrl: string;
        };
        user_response?: string;
    };
}

const Event: React.FC<EventProps> = ({ event }) => {
    const [isShowRepliesVisible, setIsShowRepliesVisible] = useState(false);
    const [response, setResponse] = useState<string | null>(event.user_response || null); // Initialize with userResponse
    const [replies, setReplies] = useState<any[]>([]);

    const showReplies = async () => {
        try {
            const fetchedReplies = await fetchEventReplies(event.id);
            console.log(fetchedReplies)
            setReplies(fetchedReplies);
            setIsShowRepliesVisible(true);
        } catch (error) {
            console.error('Error fetching replies:', error);
        }
    };

    const hideReplies = () => {
        setIsShowRepliesVisible(false);
    };

    const handleResponse = async (newResponse: string) => {
        setResponse(newResponse); // Update the response state

        // Make an API call to the backend to update the response
        try {
            const data = await updateEventResponse(event.id, newResponse); // Call the updateEventResponse function
            console.log('Response updated:', data);
        } catch (error) {
            console.error('Error updating response:', error);
        }
    };


    const profilePicture = event.creator?.avatarUrl
        ? `${API_BASE_URL}/images?imageName=${event.creator.avatarUrl}`
        : `${API_BASE_URL}/images?imageName=ProfileImage.png`;

    return (
        <div className={styles.event}>
            <div className={styles2.postHeader}>
                <img
                    src={profilePicture}
                    alt="Profile"
                    className={styles2.profilePicture}
                />
                <div className={styles2.postInfo}>
                    <p className={styles2.postAuthor}>{event.creator.username}</p>
                    <p className={styles2.postTime}>{new Date(event.created_at).toLocaleDateString('en-GB')}</p>
                </div>
            </div>
            <div className={styles.eventInfo}>
                <p className={styles.title}>{event.title}</p>
                <p>{event.description}</p>
                <div className={styles.timeContainer}>
                    <p className={styles.date}>Date: {new Date(event.event_date).toLocaleDateString('en-GB')}</p>
                    <p className={styles.time}>Time: {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                <div className={styles.responseOptions}>
                    <button
                        className={`${styles.btn} ${response === "going" ? styles.active : ""}`}
                        onClick={() => handleResponse("going")}
                    >
                        Going
                    </button>
                    <button
                        className={`${styles.btn} ${response === "not_going" ? styles.active : ""}`}
                        onClick={() => handleResponse("not_going")}
                    >
                        Not Going
                    </button>
                </div>
                <button className={styles.viewRepliesBtn} onClick={showReplies}>view replies</button>
                {isShowRepliesVisible && <RepliesWindow onClose={hideReplies} replies={replies} />}
            </div>
        </div>
    );
};

export default Event;

