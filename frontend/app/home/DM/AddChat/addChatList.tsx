import React from "react";
import styles from "../../Style/chatList.module.css";
import { UserType } from "@/app/components/usersList";
import { API_BASE_URL } from "@/app/config";
import Link from "next/link";

const addChatList: React.FC<{ newUsers: UserType[] }> = ({ newUsers }) => {
  return (
    <div className={styles.chatList}>
      {newUsers && newUsers.length > 0 ? (
        newUsers.map((user: UserType) =>
          user.id ? (
            <User key={user.id} user={user} />
          ) : null
        )
      ) : (
        <p className= {styles.note}>No new users available...</p>
      )}
    </div>
  );
};

const User: React.FC<{ user: UserType }> = ({ user }) => {
  return (
    <div className={styles.chatItem}>
      <div className={styles.profileContainer}>
        <img src={`${API_BASE_URL}/images?imageName=` + user.profileImg} className={styles.profilePic} />
        <div className={styles.status}></div>
      </div>
      <div className={styles.chatInfo}>
        <h3>{user.username}</h3>
      </div>
      <Link href={`/chat/${encodeURIComponent(user.username)}`} style={{ width: 25, height: 25 }}>
        <button className={styles.AddButton}>
          <svg
            width="25"
            height="25"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 7v10M7 12h10"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </Link>
    </div>
  );
};

export default addChatList;
