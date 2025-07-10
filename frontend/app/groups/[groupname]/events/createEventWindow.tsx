import React, { useState } from "react";
import styles from "../Styles/creatEvent.module.css";
import styles2 from "../../../home/Style/createGroup.module.css";
import { useParams } from "next/navigation";
import { createEvent } from "../../../api/group/events"; // Import the createEvent function

interface CreateEventProps {
  onClose: () => void; // Close modal after creating event
}

// Add these constants at the top after imports
const MAX_EVENT_TITLE_LENGTH = 50;
const MAX_EVENT_DESCRIPTION_LENGTH = 500;

const CreateEventWindow: React.FC<CreateEventProps> = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const { groupname } = useParams();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    if (newTitle.length <= MAX_EVENT_TITLE_LENGTH) {
      setTitle(newTitle);
      setTitleError("");
    } else {
      setTitleError(`Title must not exceed ${MAX_EVENT_TITLE_LENGTH} characters`);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    if (newDescription.length <= MAX_EVENT_DESCRIPTION_LENGTH) {
      setDescription(newDescription);
      setDescriptionError("");
    } else {
      setDescriptionError(`Description must not exceed ${MAX_EVENT_DESCRIPTION_LENGTH} characters`);
    }
  };

  // Decode the groupname
  const decodedgroupname = decodeURIComponent(Array.isArray(groupname) ? groupname[0] : groupname);
console.log(decodedgroupname)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !dateTime) {
      console.error('All fields must be filled out');
      return; // Prevent submission if any field is empty
    }

    // Convert dateTime to a Date object
    const selectedDate = new Date(dateTime);

    // Check if the selected date is in the past
    const currentDate = new Date();
    if (selectedDate <= currentDate) {
      alert('The event date must be in the future');
      return; // Prevent submission if the date is in the past
    }

    // Convert dateTime to a valid ISO 8601 format
    const eventDate = new Date(dateTime).toISOString();

    const eventData = {
      title,
      description,
      event_date: eventDate,
      group_name: decodedgroupname,
    };

    // Send event data to the backend
    try {
      await createEvent(eventData); // Call the createEvent function
      onClose(); // Close the modal on success
    } catch (error) {
      console.error('Failed to create event', error);
    }
  };

  return (
    <div className={styles2.modalOverlay}>
      <div className={styles2.modalContent}>
        <div className={styles.container}>
          <button className={styles2.closeButton} onClick={onClose}>
            X
          </button>
          <div className={styles.eventContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  required
                  className={styles.eventTitle}
                  placeholder="Title"
                  maxLength={MAX_EVENT_TITLE_LENGTH}
                />
                {titleError && <span className={styles.errorText}>{titleError}</span>}
                <span className={styles.charCount}>
                  {title.length}/{MAX_EVENT_TITLE_LENGTH}
                </span>
              </div>

              <div className={styles.inputGroup}>
                <textarea
                  id="description"
                  value={description}
                  onChange={handleDescriptionChange}
                  required
                  className={styles.textarea}
                  placeholder="Description"
                  maxLength={MAX_EVENT_DESCRIPTION_LENGTH}
                />
                {descriptionError && <span className={styles.errorText}>{descriptionError}</span>}
                <span className={styles.charCount}>
                  {description.length}/{MAX_EVENT_DESCRIPTION_LENGTH}
                </span>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="dateTime">Day/Time</label>
                <input
                  type="datetime-local"
                  id="dateTime"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  required
                  className={styles.date}
                />
              </div>
              <button type="submit" className={styles.submitButton}>
                Create Event
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventWindow;