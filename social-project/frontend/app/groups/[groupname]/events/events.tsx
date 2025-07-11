import React, { useEffect, useState } from "react";
import styles from "../Styles/posts.module.css";
import Event from "./event";
import CreateEvent from "./createEventWindow";
import { useParams } from "next/navigation";
import { fetchEvents } from "../../../api/group/events"; // Import the fetchEvents function

const Events = () => {
  const [isCreateEventVisible, setIsCreateEventVisible] = useState(false);
  const [events, setEvents] = useState<any[]>([]); // Initialize as an empty array
  const { groupname } = useParams();

  const showCreateEvent = () => {
    setIsCreateEventVisible(true);
  };
  const hideCreateEvent = () => {
    setIsCreateEventVisible(false);
  };

  const loadEvents = async () => {
    try {
      const decodedGroupName = decodeURIComponent(groupname as string);
      const data = await fetchEvents(decodedGroupName);
      setEvents(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadEvents(); // Load events when the component mounts
  }, [groupname]);

  return (
    <div className={styles.contentContainer}>
      <div className={styles.content}>
        {events?.length > 0 ? ( // Check if events array has items
          events.map((event) => (
            <Event key={event.id} event={event} /> // Pass event data to Event component
          ))
        ) : (
          <p className={styles.noEvent}>No events available</p> // Fallback UI if no events
        )}
      </div>
      <div className={styles.CreateBtnContainer}>
        <button className={styles.CreateBtn} onClick={showCreateEvent}>
          Create Event
        </button>
        {isCreateEventVisible && (
          <CreateEvent onClose={() => { hideCreateEvent(); loadEvents(); }} /> // Refresh events after closing
        )}
      </div>
    </div>
  );
};

export default Events;
