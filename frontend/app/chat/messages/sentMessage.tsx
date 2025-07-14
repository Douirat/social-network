import React from 'react'
import styles from "../Style/chat.module.css";
import { ChatMessage } from '@/app/home/DM/Chat/chatList';
import { formatDateTime } from "./receivedMessage";


const sentMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
  return (
      <div className={`${styles.message} ${styles.sent}`}>
        <p>{message.content}</p>
        <span className={`${styles.timestamp} ${styles.sentTimestamp}`}>{formatDateTime(message.createdAt)}</span>
      </div>
  )
}

export default sentMessage
