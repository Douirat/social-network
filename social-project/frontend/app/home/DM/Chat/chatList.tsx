import React from 'react'
import styles from '../../Style/chatList.module.css'
import { UserType } from '@/app/components/usersList'
import { Group } from '../ShowGroups/groupsList'
import { API_BASE_URL } from '@/app/config'
import Link from "next/link";
import ProfileImage from "@/app/components/Images/ProfileImage.png";

export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  groupId: number;
  content: string;
  createdAt: Date;
}

export interface Chat {
  messages: ChatMessage[];
  userA: UserType;
  userB: UserType;
  group: Group
  notification: Number
}

interface ChatListProps {
  chats: Chat[];
  handleChatClick: (idx: number) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, handleChatClick }) => {
  return (
    <div className={styles.chatList}>
      {chats && chats.length > 0 ? (
        chats.map((chat,idx) =>
          chat.userB.id ? (
            <User key={idx} chat={chat} handleChatClick={() => handleChatClick(idx)}/>
          ) : chat.group.id ? (
            <GroupChat key={idx} chat={chat} handleChatClick={() => handleChatClick(idx)}/>
          )
          : null
        )
      ) : (
        <p className={styles.note}>No Chats to display</p>
      )}
    </div>
  );
};

const GroupChat: React.FC<{ chat: Chat, handleChatClick: () => void }> = ({ chat, handleChatClick }) => {
  if (!chat) {
    return null;
  }
  const groupImage = chat.group.image ? `${API_BASE_URL}/images?imageName=${chat.group.image}` : ProfileImage.src;

  return (
    <Link href={`/groups/${encodeURIComponent(chat.group.title)}`} onClick={handleChatClick}>
      <div className={styles.chatItem}>
        <div className={styles.profileContainer}>
          <img
            src={groupImage}
            className={styles.profilePic}
            alt="Group Avatar"
          />
        </div>
        <div className={styles.chatInfo}>
          <h3>{chat.group.title}</h3>
          {chat.messages.length > 0 ? (
            <p>{
              chat.messages[0].senderId === chat.userA.id ? "You" : chat.group.members.find((member) => chat.messages[0].senderId === member.id)?.username}{": " + chat.messages[0].content}</p>
          ) : (
            <p className={styles.note}>No Messages to display</p>
          )}
        </div>
        {
          chat.notification ? (
            <div className={styles.chatMeta}>
              <span className={styles.notification}>{chat.notification.toString()}</span>
            </div>
          ) : null
        }
      </div>
    </Link>
  );
};

const User: React.FC<{ chat: Chat, handleChatClick: () => void, isOnline?: boolean }> = ({ chat, handleChatClick, isOnline = false }) => {
  if (!chat) {
    return null;
  }
  const userImage = chat.userB.profileImg ? `${API_BASE_URL}/images?imageName=${chat.userB.profileImg}` : ProfileImage.src;

  return (
    <Link href={`/chat/${encodeURIComponent(chat.userB.username)}`} onClick={handleChatClick}>
      <div className={styles.chatItem}>
        <div className={styles.profileContainer}>
          <img
            src={userImage}
            className={styles.profilePic}
            alt="User Avatar"
          />
        </div>
        <div className={styles.chatInfo}>
          <h3>{chat.userB.username}</h3>
          {chat.messages.length > 0 ? (
            <p>{chat.messages[0].senderId === chat.userA.id ? "You: " : ""}{chat.messages[0].content}</p>
          ) : (
            <p className={styles.note}>No Messages to display</p>
          )}
        </div>
        {
          chat.notification ? (
            <div className={styles.chatMeta}>
              <span className={styles.notification}>{chat.notification.toString()}</span>
            </div>
          ) : null
        }
      </div>
    </Link>
  );
};


export default ChatList
