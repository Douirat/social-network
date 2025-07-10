"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../chat/Style/chat.module.css";
import Nav from "../../components/nav";
import DM from "../../home/DM/directMessages";
import ChatMessages from "../../chat/chatMessages";
import ChatInput from "@/app/chat/chatInput";
import groupStyles from "./Styles/groupPage.module.css";
import Posts from "./posts/posts";
import Events from "./events/events";
import InviteBtn from "./invitation/inviteBtn";
import { fetchGroupDetails } from "../../api/group/details";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "../../config";
import GroupDetails from "./info/info";
import Link from "next/link";
import errorStyles from "./Styles/errorPage.module.css";
import { fetchGroupChat } from "@/app/api/chat";

const GroupPage: React.FC = () => {
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const { groupname } = useParams();
  const [isGroupDetailsVisible, setIsGroupDetailsVisible] = useState(false);
  const [chat, setChat] = useState<any>(null); // Add this state for chats

  const showGroupDetails = () => {
    setIsGroupDetailsVisible(true);
  };

  const hideGroupDetails = () => {
    setIsGroupDetailsVisible(false);
  };

  useEffect(() => {
    const loadGroupDetails = async () => {
      try {
        const decodedGroupName = decodeURIComponent(groupname as string).replace(/-/g, ' ');
        const result = await fetchGroupDetails(decodedGroupName);
        if (result.status === 200) {
          if (result.message) {
            // Handle specific messages
            setError(result.message);
          } else if (result.group) {
            // Handle successful group data fetch
            const profilePicture = result.group.image
              ? `${API_BASE_URL}/images?imageName=${result.group.image}`
              : `${API_BASE_URL}/images?imageName=ProfileImage.png`;
            result.group.image = profilePicture;
            setGroup(result.group);
            const resultChat = await fetchGroupChat(result.group.id)
            if (resultChat) {
              setChat(resultChat)
            }
          }
        } else {
          // Handle non-200 status codes
          setError(result.message || "Failed to load group details");
        }
      } catch (error) {
        // Handle network errors or unexpected exceptions
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    loadGroupDetails();
  }, [groupname]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className={errorStyles.errorContainer}>
        <Nav />
        <div className={errorStyles.errorContent}>
          <h1 className={errorStyles.errorTitle}>Oops! Group Error:</h1>
          <p className={errorStyles.errorMessage}>{error}</p>
          {error === "You have a pending invitation to this group" && (
            <p>Please wait for the group admin to accept your request.</p>
          )}
          {error === "You are not a member of this group please send a request" && (
            <button onClick={() => {/* Implement send request logic */ }}>
              Send Request to Join
            </button>
          )}
          <Link href="/home" className={errorStyles.homeButton}>
            Go to Home Page
          </Link>
        </div>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  const handleButtonClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <Nav />
      {isGroupDetailsVisible && (
        <GroupDetails onClose={hideGroupDetails} group={group} router={router} />
      )}
      <div className={styles.content}>
        <div className={styles.chatContainer}>
          <div className={groupStyles.Header}>
            <div className={styles.userInfo}>
              <div className={styles.profileContainer} onClick={showGroupDetails}>
                <img
                  src={group.image}
                  alt="Profile"
                  className={styles.profilePic}
                />
                <div className={styles.status}></div>
              </div>

              <span className={styles.username}>{group.title}</span>
            </div>
            <div className={groupStyles.btnsContainer}>
              <button
                className={` ${groupStyles.btn} ${activeTab === "chat" ? groupStyles.active : ""
                  }`}
                onClick={() => handleButtonClick("chat")}
              >
                Chat
              </button>
              <button
                className={` ${groupStyles.btn} ${activeTab === "posts" ? groupStyles.active : ""
                  }`}
                onClick={() => handleButtonClick("posts")}
              >
                Posts
              </button>
              <button
                className={` ${groupStyles.btn} ${activeTab === "events" ? groupStyles.active : ""
                  }`}
                onClick={() => handleButtonClick("events")}
              >
                Events
              </button>
              <InviteBtn />
            </div>
          </div>
          <div className={groupStyles.contentContainer}>
            {activeTab === "chat" && chat ? (
              <div className={styles.chat}>
                <ChatMessages chat={chat} />
                <ChatInput chat={chat} />
              </div>
            ) : null}
            {activeTab === "posts" && <Posts />}
            {activeTab === "events" && <Events />}
          </div>
        </div>
        <div className={styles.DMcontainer}>
          <DM />
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
