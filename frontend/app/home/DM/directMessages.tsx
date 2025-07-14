"use client"
import React, { useState, useEffect, useContext, useCallback } from "react";
import styles from "../Style/directMessages.module.css";
import chatListStyles from "../Style/chatList.module.css";
import CreateGroupBtn from "./CreateGroup/createGroupBtn";
import SearchDM from '../../components/searchDM'
import AddChatBtn from './AddChat/addChatBtn'
import ShowGroupsBtn from "./ShowGroups/showGroupsBtn";
import ChatBtn from "./Chat/chatBtn";
import ChatList, { Chat } from './Chat/chatList'
import AddChatList from './AddChat/addChatList'
import GroupsList from './ShowGroups/groupsList'
import { fetchAllChats, fetchNewUsersChat, markChatAsRead, markGroupChatAsRead } from "@/app/api/chat";
import { API_BASE_URL } from "../../config";
import { AuthContext } from "@/app/auth/AuthProvider";
import { UserType } from "@/app/components/usersList";
import { usePathname } from 'next/navigation'

const DirectMessages = () => {
  const { messages, user } = useContext(AuthContext); // Websocket messages
  const [activeContent, setActiveContent] = useState<string>('chat');
  const [activeGroupTab, setActiveGroupTab] = useState<string>('Created');
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [groups, setGroups] = useState<{ [key: string]: any[] }>({
    Created: [],
    Joined: [],
    Discover: []
  });
  const [filteredGroups, setFilteredGroups] = useState<{ [key: string]: any[] }>({
    Created: [],
    Joined: [],
    Discover: []
  });
  const [chats, setChats] = useState<Chat[]>([]); // Add this state for chats
  const [addChat, setAddChat] = useState<UserType[]>([]); // Add this state for chats
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pathName = usePathname()

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      } else {
        console.error('Failed to fetch groups');
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChats = async () => {
    setIsLoading(true);
    try {
      const chats = await fetchAllChats()
      setChats(chats)
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddChat = async () => {
    setIsLoading(true);
    try {
      const newUsers = await fetchNewUsersChat()
      setAddChat(newUsers)
    } catch (error) {
      console.error('Error fetching new users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);


  useEffect(() => {
    if (messages.length > 0) {
      // Handle websocket messages
      messages.forEach((wsmsg: any) => {
        if (wsmsg.type === "chat" && wsmsg.payload) {
          if (chats && chats.length > 0) {
            const newChats = chats
            // check for relevent chat based on user or group ids
            const latestMessageChatIdx = newChats.findIndex((cht: Chat) =>
            (wsmsg.payload.receiverId !== 0 &&
              (
                (cht.userA.id === wsmsg.payload.senderId && cht.userB.id === wsmsg.payload.receiverId) ||
                (cht.userB.id === wsmsg.payload.senderId && cht.userA.id === wsmsg.payload.receiverId)
              )
              || (wsmsg.payload.groupId !== 0 && cht.group.id === wsmsg.payload.groupId)))
            if (latestMessageChatIdx !== -1) { // match found
              newChats[latestMessageChatIdx].messages = [wsmsg.payload] // update latest message
              const latestChat = newChats[latestMessageChatIdx]
              // check if chat is open. If so, clear notifications before they show up, if not, update llocal notification count
              if (wsmsg.payload.groupId !== 0 && pathName === `/groups/${encodeURIComponent(latestChat.group.title)}`) {
                markGroupChatAsRead(latestChat.group.id.toString())
              } else if (wsmsg.payload.receiverId !== 0 && pathName === `/chat/${encodeURIComponent(latestChat.userB.username)}`) {
                markChatAsRead(latestChat.userB.username)
              } else if (wsmsg.payload.senderId !== user?.id) {
                latestChat.notification = (+latestChat.notification || +0) + 1
              }
              // put latest message at the start of the array
              newChats.splice(latestMessageChatIdx, 1)
              newChats.unshift(latestChat)
              setChats(newChats)
            } else {
              fetchChats();
              fetchAddChat();
            }
          } else {
            fetchChats();
            fetchAddChat();
          }
        }
      })
    }
  }, [messages])

  const handleButtonClick = (content: string) => {
    setActiveContent(content);
    // For these, we can add checks for the state variable lengths to see if we need to fetch them again or not.
    // That would be better for performance but more likely to not update properly
    if (content === 'groups') {
      fetchGroups();
    } else if (content === 'chat') {
      fetchChats();
    } else if (content === 'addChat') {
      fetchAddChat();
    }
  };

  const handleGroupTabClick = (tab: string) => {
    setActiveGroupTab(tab);
  };

  const handleChatClick = (idx: number) => {
    const newChats = chats
    newChats[idx].notification = 0
    if (newChats[idx].group.id === 0) {
      markChatAsRead(newChats[idx].userB.username)
    } else {
      markGroupChatAsRead(newChats[idx].group.id.toString())
    }
    setChats(newChats)
  }

  const getHeaderText = () => {
    if (activeContent === 'chat') return 'Messages';
    if (activeContent === 'groups') return 'Groups';
    if (activeContent === 'addChat') return 'Add Chat';
    return 'Messages';
  };

  const handleSearch = useCallback((srchQuery: string) => {
    setSearchQuery(srchQuery)
  }, [activeContent, activeGroupTab]);

  return (
    <div className={styles.messagesContainer}>
      <div className={styles.messagesHeader}>
        <h2>{getHeaderText()}</h2>
        <div className={styles.BtnsContainer}>
          <ChatBtn onClick={() => handleButtonClick('chat')} />
          <AddChatBtn onClick={() => handleButtonClick('addChat')} />
          <ShowGroupsBtn onClick={() => handleButtonClick('groups')} />
          <CreateGroupBtn />
        </div>
      </div>
      <SearchDM
        onSearch={handleSearch}
      />
      <div className={`${styles.content} ${chatListStyles.chatList}`}>
        {activeContent === 'chat' && <ChatList chats={chats?.filter((chat) =>
          chat.userB.username.toLowerCase().includes(searchQuery.toLowerCase())
          || chat.group.title.toLowerCase().includes(searchQuery.toLowerCase()))}
          handleChatClick={handleChatClick} />}
        {activeContent === 'addChat' && <AddChatList newUsers={addChat?.filter((user) => user.username.toLowerCase().includes(searchQuery.toLowerCase()))} />}
        {activeContent === 'groups' && (
          <div className={styles.groupsContent}>
            <div className={styles.groupTabs}>
              {['Created', 'Joined', 'Discover'].map((tab) => (
                <button
                  key={tab}
                  className={`${styles.groupTab} ${activeGroupTab === tab ? styles.activeGroupTab : ''}`}
                  onClick={() => handleGroupTabClick(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            {isLoading ? (
              <p>Loading groups...</p>
            ) : (
              <GroupsList groups={groups[activeGroupTab]?.filter((group) => group.title.toLowerCase().includes(searchQuery.toLowerCase())) || []} groupType={activeGroupTab as 'Created' | 'Joined' | 'Discover'} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectMessages;
