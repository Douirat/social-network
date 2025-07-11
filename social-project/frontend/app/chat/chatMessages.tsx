"use client"
import React, { useState, useEffect, useCallback, useContext } from "react";
import styles from "./Style/chat.module.css";
import SentMessage from "./messages/sentMessage";
import ReceivedMessage from "./messages/receivedMessage";
import GroupReceivedMessage from "./messages/groupReceivedMessage";
import GroupSendMessage from "./messages/groupSendMessage";
import { Chat, ChatMessage } from "../home/DM/Chat/chatList";
import { AuthContext } from "../auth/AuthProvider";


const ChatMessages: React.FC<{ chat: Chat }> = ({ chat }) => {
  const { messages } = useContext(AuthContext); // Websocket messages
  const [realTimeMessages, setRealTimeMessages] = useState<ChatMessage[]>([])

  const generateUserMessages = (msg: ChatMessage) => {
    if (msg.senderId === chat.userA.id) {
      return (<SentMessage key={msg.id} message={msg} />)
    }
    return (<ReceivedMessage key={msg.id} message={msg} />)
  }

  const generateGroupMessages = (msg: ChatMessage) => {
    const usr = chat.group.members.find((member) => member.id === msg.senderId)
    if (usr) {
      if (msg.senderId === chat.userA.id) {
        return (<GroupSendMessage key={msg.id} message={msg} user={usr}/>)
      }
      return (<GroupReceivedMessage key={msg.id} message={msg} user={usr}/>)
    }
  }

  useEffect(() => {
    const chatContainer = document.getElementsByClassName(styles.chatMessages)[0]
    if (chatContainer) {
      chatContainer.scrollTo(0, chatContainer.scrollHeight);
    }
  })

  useEffect(() => {
    if (messages.length > 0) {
      messages.forEach((wsmsg: any) => {
        if (wsmsg.type === "chat" && wsmsg.payload && 
          (chat.userB.id !== 0 && 
            ((wsmsg.payload.senderId === chat.userB.id && wsmsg.payload.receiverId === chat.userA.id)
            ||(wsmsg.payload.receiverId === chat.userB.id && wsmsg.payload.senderId === chat.userA.id)))
          ||(chat.group.id !== 0 && wsmsg.payload.groupId === chat.group.id)) {
          setRealTimeMessages([...realTimeMessages, wsmsg.payload])
          const chatContainer = document.getElementsByClassName(styles.chatMessages)[0]
          if (chatContainer) {
            chatContainer.scrollTo(0, chatContainer.scrollHeight);
          }
        }
      })
    }
  }, [messages])

  return (
    <div className={styles.chat}>
      <div className={styles.chatMessages}>
        {
          chat && chat.userB && chat.userB.id !== 0 ? (
            <>
              {chat.messages ? (
                chat.messages.map(generateUserMessages)
              ) : null}
              {realTimeMessages ? (
                realTimeMessages.map(generateUserMessages)
              ) : null}
            </>
          ) : null
        }
        {
          chat && chat.group && chat.group.id !== 0 ? (
            <>
              {chat.messages ? (
                chat.messages.map(generateGroupMessages)
              ) : null}
              {realTimeMessages ? (
                realTimeMessages.map(generateGroupMessages)
              ) : null}
            </>
          ) : null
        }
      </div>
    </div>
  );
};

export default ChatMessages;
