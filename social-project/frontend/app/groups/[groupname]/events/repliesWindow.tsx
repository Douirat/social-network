import React, { useState } from "react";
import styles from "../Styles/repliesWindow.module.css";
import styles2 from "../../../home/Style/createGroup.module.css";
import styles3 from "../../../home/Style/chatList.module.css";
import { API_BASE_URL } from '../../../config'; 

interface ShowRepliesProps {
  onClose: () => void;
  replies: {
    id: number;
    event_id: number,
    user: {
      id: number;
      username: string;
      avatarUrl: string;
    };
    response: string;
  }
}

const RepliesWindow: React.FC<ShowRepliesProps> = ({ onClose, replies }) => {
  // Ensure replies is typed as an array
  const goingUsers = Array.isArray(replies) ? replies.filter(reply => reply.response === "going") : [];
  const notGoingUsers = Array.isArray(replies) ? replies.filter(reply => reply.response === "not_going") : [];
  
  return (
    <div className={styles2.modalOverlay}>
      <div className={styles2.modalContent}>
        <div className={styles.container}>
          <button className={styles2.closeButton} onClick={onClose}>
            X
          </button>
          <div className={styles.repliesContainer}>
            <div className={styles.goingDiv}>
              <p className={styles.goingText}>Going</p>
              <div className={styles.usersListContainer}>
                {goingUsers.map(reply => (
                  <User key={`${reply.user.userID}-going`} username={reply.user.username} profileImage={reply.user.avatarUrl} /> 
                ))}
              </div>
            </div>
            <div className={styles.notGoingDiv}>
              <p className={styles.notGoingText}>Not Going</p>
              <div className={styles.usersListContainer}>
                {notGoingUsers.map(reply => (
                  <User key={`${reply.user.userID}-not-going`} username={reply.user.username} profileImage={reply.user.avatarUrl} /> 
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface UserProps {
  username: string;
  profileImage: string;
}

const User: React.FC<UserProps> = ({ username, profileImage }) => { 
  const profilePicture = profileImage? `${API_BASE_URL}/images?imageName=${profileImage}`
    : `${API_BASE_URL}/images?imageName=ProfileImage.png`; 

  return (
    <div className={styles3.chatItem}>
      <div className={styles3.profileContainer}>
        <img src={profilePicture} className={styles3.profilePic} alt={username} /> 
        <div className={styles3.status}></div>
      </div>
      <div className={styles3.chatInfo}>
        <h3>{username}</h3>
      </div>
    </div>
  );
};

export default RepliesWindow;
