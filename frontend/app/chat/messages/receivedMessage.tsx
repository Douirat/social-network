import React from 'react'
import styles from "../Style/chat.module.css";
import { ChatMessage } from '@/app/home/DM/Chat/chatList';

export const formatDateTime = (date: Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const receivedMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
  return (
      <div className={`${styles.message} ${styles.received}`}>
        <p>{message.content}</p>
        <span className={`${styles.timestamp} ${styles.receivedTimestamp}`}>{formatDateTime(message.createdAt)}</span>
      </div>
      
  );
}

export default receivedMessage
