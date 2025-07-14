import styles from "../Style/chat.module.css";
import { ChatMessage } from '@/app/home/DM/Chat/chatList';
import { UserType } from "@/app/components/usersList";
import { API_BASE_URL } from "@/app/config";
import { formatDateTime } from "./receivedMessage";

const GroupSendMessage: React.FC<{ message: ChatMessage, user: UserType }> = ({ message, user }) => {
  return (
    <div className={styles.GroupMessage}>
      <div className={`${styles.message} ${styles.sent}`}>
        <p><b>{user.username + ":"}</b></p>
        <p>{message.content}</p>
        <span className={`${styles.timestamp} ${styles.sentTimestamp}`}>{formatDateTime(message.createdAt)}</span>
      </div>
      <div className={styles.userImageContainer}>
        <img
          className={styles.userImage}
          src={user && user.profileImg ? `${API_BASE_URL}/images?imageName=` + user.profileImg : "https://via.placeholder.com/40"}
          alt="Profile"
        ></img>
      </div>
    </div>
  );
};

export default GroupSendMessage;
