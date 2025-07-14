"use client"
import React, { useEffect, useState } from "react";
import ChatMessages from "../chatMessages";
import styles from "../Style/chat.module.css";
import Nav from "../../components/nav";
import DM from "../../home/DM/directMessages";
import { fetchChat } from "@/app/api/chat";
import { usePathname } from 'next/navigation'
import ChatHeader from "../chatHeader";
import ChatInput from "../chatInput";
import Link from 'next/link';

const page = () => {
  const [chat, setChat] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const pathName = usePathname()

  const fetchAndSetChat = async () => {
    const splitPathName = pathName.split("/", 3)
    if (splitPathName.length < 3) {
      setError("No username found");
      return;
    }
    const userBName = splitPathName[2];
    try {
      const c = await fetchChat(userBName);
      setChat(c);
    } catch (err) {
      setError("Failed to fetch chats");
    }
  }

  useEffect(() => {
    fetchAndSetChat();
  }, []);

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Nav />
        <div className={styles.errorContent}>
          <h1 className={styles.errorTitle}>Oops! Chat Not Found</h1>
          <p className={styles.errorMessage}>{error}</p>
          <Link href="/" className={styles.homeButton}>
            Go to Home Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav></Nav>
      <div className={styles.content}>
        <div className={styles.chatContainer}>
          {chat && chat.userB ? (
            <ChatHeader userB={chat.userB} />
          ) : null}
          {chat ? (
            <div className={styles.chat}>
              <ChatMessages chat={chat} />
              {
                chat.allowChat ? (<ChatInput chat={chat} />) : (
                  <div className={styles.chatInputContainer}>
                    <div className={styles.chatInputDiv}>
                      <p className={styles.chatInputDisabled}>You must have a follower relationship with this user to chat</p>
                    </div>
                  </div>)
              }
            </div>
          ) : null}
        </div>
        <div className={styles.DMcontainer}>
          <DM></DM>
        </div>
      </div>
    </div>
  );
};

export default page;
