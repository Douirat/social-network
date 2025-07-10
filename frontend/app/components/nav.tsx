"use client";

import React, { useContext, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../auth/AuthProvider";
import {fetchUnreadCount, markNotificationsAsRead} from "../api/notifications"
import styles from "./Style/nav.module.css";
import User from "../components/userItem";
import Search from "../components/search";
import {UserType} from "../components/usersList";
import Notifications from "./notifications";
import { API_BASE_URL } from "../config";
import { logout } from "../utils/authUtils";
import ProfileImage from "../components/Images/ProfileImage.png"; // Import the default profile image
//import { Notification } from '../../types'; // Import your Notification type

const Nav: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, user, setIsLoggedIn, setUser, messages, setMessages } = useContext(AuthContext);
  const [notificationsCount, setNotificationsCount] = useState(user?.notifications || 0);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [messagesProcessed, setMessagesProcessed] = useState(false);
  const notificationRef = useRef(null);

  const basePath = `${API_BASE_URL}/images?imageName=`;

     // Fetch unread count when the component mounts
     useEffect(() => {
      if (isLoggedIn) {
          fetchUnreadCount(setNotificationsCount); 
      }
  }, [isLoggedIn]); 


  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      setIsLoggedIn(false);
      setUser(null);
      router.push("/");
    } else {
      console.error("Logout failed");
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Only handle clicks if notifications are being shown
      if (showNotifications) {
        if (
          notificationRef.current &&
          !(notificationRef.current as Node).contains(event.target as Node)
        ) {
          setShowNotifications(false);
          markNotificationsAsRead(setNotificationsCount);
        }
      }
    }

    // Only add the event listener if notifications are being shown
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
      
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [notificationRef, markNotificationsAsRead, showNotifications]);

  const profilePicture = user?.avatarUrl ? `${basePath}${user.avatarUrl}` : ProfileImage.src;

  
  const handleNotificationClick = (e) => {
    e.preventDefault();
    setShowNotifications(!showNotifications);
  };

  

  useEffect(() => {
    // Check for new messages in the context
    if (messages.length > 0) {
        const newNotifications = messages.filter(message => message.type === 'notification');
        const newDeDeNotifications = messages.filter(message => message.type === 'denotification');

        // Fetch the updated unread count for both notifications and denotifications
        if (newNotifications.length > 0 || newDeDeNotifications.length > 0) {
            fetchUnreadCount(setNotificationsCount); // Fetch the updated unread count
        }

        // Show the notification popup only for new notifications
        if (newNotifications.length > 0) {
            setShowNotificationPopup(true);
            setNotificationMessage(newNotifications[0].payload.content); 

            setTimeout(() => {
                setShowNotificationPopup(false);
            }, 4000); // Hide the popup after 4 seconds
        }

        // Mark messages as processed and reset them
        setMessages([]); // Reset messages after processing
        setMessagesProcessed(true); // Set the flag to true
    }
}, [messages, fetchUnreadCount]);



const [users, setUsers] = useState<UserType[]>([]);
const [filteredUsers, setFilteredUsers] = useState<UserType[]>(users);
const [isUserListVisible, setUserListVisible] = useState(false);
const searchRef = useRef<HTMLInputElement>(null);

const handleSearchFocus = () => {
    setUserListVisible(true);
};


const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setUserListVisible(false);
    }
};

// Add event listener for clicks outside the search box
React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, []);

  // Update filtered users when the original users list changes
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => { // Wrapped fetch in a function
      try {
        const response = await fetch('http://localhost:8080/api/users', {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers(); // Call the fetch function
  }, []); // Empty dependency array to run once on mount


  return (
    <nav className={styles.navbar}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 5 Q30 20 20 35 Q10 20 20 5"
          fill="none"
          stroke="var(--logo-color)"
          strokeWidth="3"
        />
        <path
          d="M5 20 Q20 30 35 20 Q20 10 5 20"
          fill="none"
          stroke="var(--logo-color)"
          strokeWidth="3"
        />
        <circle cx="20" cy="20" r="4" fill="var(--logo-color)" />
        <circle cx="10" cy="10" r="2" fill="var(--logo-color)" />
        <circle cx="30" cy="10" r="2" fill="var(--logo-color)" />
        <circle cx="10" cy="30" r="2" fill="var(--logo-color)" />
        <circle cx="30" cy="30" r="2" fill="var(--logo-color)" />
      </svg>


      {showNotificationPopup && (
      <div className={styles.notificationPopup}>
        <p>{notificationMessage}</p>
      </div>
    )}
 <div className={styles.searchBox} ref={searchRef}>
            <Search users={users} setFilteredUsers={setFilteredUsers} onFocus={handleSearchFocus} />
            {isUserListVisible && filteredUsers.length > 0 && (
    <div className={styles.usersList}>
        {filteredUsers.map((user) => (
          <div className={styles.userWrapper} key={user.id}>
            <a href={`/u/${user.username}`} key={user.id} style={{ textDecoration: 'none' }}>
                <User
                    key={user.id}
                    username={user.username}
                    profileImg={user.profileImg}
                    isChecked={false} 
                    toggleCheck={() => {} }
                />
            </a>
            </div>
        ))}
    </div>
)}
        </div>


      <div className={styles.navItems}>
        <a href="/home" className={styles.navItem}>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.58 7.35L12.475 1.897a1 1 0 00-.95 0L1.425 7.35A1.002 1.002 0 001.9 9.231c.16 0 .324-.038.475-.12l.734-.396 1.59 11.25c.216 1.214 1.31 2.062 2.66 2.062h9.282c1.35 0 2.444-.848 2.662-2.088l1.588-11.225.737.398a1 1 0 00.95-1.759zM12 15.435a3.25 3.25 0 110-6.5 3.25 3.25 0 010 6.5z" />
          </svg>
        </a>
        <div className={styles.notificationWrapper} ref={notificationRef}>
          <a
            href="#notifications"
            className={styles.navItem}
            onClick={handleNotificationClick}
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.697 16.468c-.02-.016-2.14-1.64-2.103-6.03.02-2.533-.812-4.782-2.347-6.334-1.375-1.393-3.237-2.164-5.242-2.172h-.013c-2.004.008-3.866.78-5.242 2.172-1.534 1.553-2.367 3.802-2.346 6.333.037 4.332-2.02 5.967-2.102 6.03a.75.75 0 00.446 1.353h4.73c.1 2.416 2.1 4.31 4.52 4.31s4.42-1.894 4.52-4.31h4.73c.9 0 1.46-.988.832-1.74a.75.75 0 00-.386-.282zM12 19.79c-1.624 0-2.97-1.3-3.1-2.98h6.2c-.13 1.68-1.476 2.98-3.1 2.98z" />
            </svg>
          </a>
          {notificationsCount!=0 &&<span className={styles.notificationBadge}>{notificationsCount}</span> }
          {showNotifications && (
            <div className={styles.notificationsDropdown}>
               <Notifications setNotificationsCount={setNotificationsCount} />
            </div>
          )}
           
        </div>

        <a href="/createpost" className={styles.navItem}>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#B3B4BD" />
            <path
              d="M7 12h10M12 7v10"
              stroke="#192734"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </a>

        {isLoggedIn && user && (
          <div className={styles.profileContainer}>
            <a href={`/u/${encodeURIComponent(user.username)}`}>
              <img
                src={profilePicture}
                alt="Profile"
                className={styles.navProfileImage}
              />
            </a>
            <a href={`/u/${encodeURIComponent(user.username)}`} className={styles.navUsername}>
              {user.username}
            </a>
          </div>
        )}

        {isLoggedIn && (
          <button onClick={handleLogout} className={styles.navItem}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15 3H9C7.34315 3 6 4.34315 6 6V18C6 19.6569 7.34315 21 9 21H15"
                stroke="#B3B4BD"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M10 12H21M21 12L18 9M21 12L18 15"
                stroke="#B3B4BD"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Nav;