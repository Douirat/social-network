import React, { useContext, useEffect, useState } from 'react';
import styles from "./Style/notifications.module.css";
import { AuthContext } from '../auth/AuthProvider';
import { API_BASE_URL } from "../config";
import Link from 'next/link';
import { markNotificationsAsRead } from '../api/notifications';
import profileImage from './Images/ProfileImage.png';
import { Notification } from '../../types';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection

const basePath = `${API_BASE_URL}/images?imageName=`;


const Notifications: React.FC<{ setNotificationsCount: React.Dispatch<React.SetStateAction<number>> }> = ({ setNotificationsCount }) => {
  const { messages } = useContext(AuthContext); // Access messages from context
  const [notifications, setNotifications] = useState<Notification[]>([]); // State for notifications
  const [buttonVisible, setButtonVisible] = useState(true);
  const fetchNotifications = async () => {

    try {
      const response = await fetch(`${API_BASE_URL}/api/new-notifications`, {
        method: 'GET',
        credentials: 'include',
      }); 
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      setNotifications(data); 

    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };


  useEffect(() => {
    fetchNotifications();
  }, [messages]);



  const handleShowPreviousNotifications = () => {
    fetch(`${API_BASE_URL}/api/notifications`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch previous notifications");
        }
        return response.json();
      })
      .then((data) => {
        setNotifications(data); 
      })
      .catch((error) => {
        console.error("Error fetching previous notifications:", error);
        // Handle errors
      });
    setButtonVisible(false);
  };



  return (
    <div className={styles.notificationsContainer}>

      {!notifications || notifications.length === 0 ? (
        <p className={styles.note}>No new notifications</p>
      ) : (
        notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} setNotificationsCount={setNotificationsCount} /> 
        ))
      )}
      <div className={styles.showPreviousNotifications}>
      {buttonVisible && (
        <button className={styles.showPreviousButton} onClick={handleShowPreviousNotifications}>
          Show previous notifications
        </button>
      )}
      </div>
    </div>
  );
};




const NotificationItem: React.FC<{ notification: Notification; setNotificationsCount: React.Dispatch<React.SetStateAction<number>> }> = ({ notification, setNotificationsCount }) => {
  const renderNotificationContent = () => {
    switch (notification.type) {
      case "follow_request":
        return <FollowRequest user={notification} setNotificationsCount={setNotificationsCount} />;
      case "group_invitation":
        return <GroupInvitation user={notification} setNotificationsCount={setNotificationsCount} />;
      case "group_join_request":
        return <GroupJoinRequest request={notification} setNotificationsCount={setNotificationsCount} />;
      default:
        return <Informing user={notification} setNotificationsCount={setNotificationsCount} />;
    }
  };

  return (
    <div className={styles.notification}  > {/* Add click handler */}
      {renderNotificationContent()}
    </div>
  );
};


const FollowRequest: React.FC<{ user: Notification; setNotificationsCount: React.Dispatch<React.SetStateAction<number>> }> = ({ user, setNotificationsCount  }) => {
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null); // State to track if the request is accepted or rejected
  const profilePicture = user?.notifyingImage ? `${basePath}${user.notifyingImage}` : profileImage.src;
  const router = useRouter();
  const handleClick = () => {
  
    markNotificationsAsRead(setNotificationsCount);
    
    // Navigate to the desired route
    router.push(`/u/${user.object}`);
  };
  const handleResponse = async (responseType: 'accept' | 'decline') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Follow-requests`, { 
        method: 'POST',
          credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.notifyingUserId, 
          action: responseType, 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send response');
      }

      const result = await response.json();
      console.log('Response from server:', result);

      // Update the state based on the response
      if (responseType === 'accept') {
        setIsAccepted(true);
      } else {
        setIsAccepted(false);
      }
    } catch (error) {
      console.error('Error handling follow request:', error);
    }
  };
  const timestamp = user.createdAt;
  const dateTime = new Date(timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium' });

  return (
    <div className={styles.notificationContent}>
       <div onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className={styles.notificationsubContent}>
        <img src={profilePicture} alt="User" className={styles.userImage} />
        <p>{user.content}</p>
      </div>
      <div className={styles.dateTime}>{dateTime}</div>
      </div>
      <div className={styles.actionButtons}>
        {isAccepted === null ? ( // If isAccepted is null, show buttons
          <>
            <button className={styles.acceptButton} onClick={() => handleResponse('accept')}>Accept</button>
            <button className={styles.declineButton} onClick={() => handleResponse('decline')}>Decline</button>
          </>
        ) : isAccepted ? ( // If accepted, show accepted message
          <button className={styles.acceptButton}>Accepted</button>
        ) : ( // If rejected, show rejected message
          <button className={styles.declineButton}>Declined</button>
        )}
      </div>
      
    </div>
  );
};

const Informing: React.FC<{ user: Notification; setNotificationsCount: React.Dispatch<React.SetStateAction<number>> }> = ({ user, setNotificationsCount }) => {
  const profilePicture = user?.notifyingImage ? `${basePath}${user.notifyingImage}` : profileImage.src;
  const router = useRouter();

  const handleClick = () => {
    markNotificationsAsRead(setNotificationsCount);
    if (user.type === 'post' || user.type === 'comment' || user.type === 'reaction') {
      router.push(`/posts/${user.objectId}`);
    } else if (user.type === 'follow') {
      router.push(`/u/${user.object}`);
    } else if (user.type === 'group' || user.type === 'group_invitation' || user.type === 'group_join_request' || user.type === 'event_creation') {
      router.push(`/groups/${user.object}`);
    }
  };

  const timestamp = user.createdAt;
  const dateTime = new Date(timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium' });

  return (
    <div className={styles.notificationContent} onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className={styles.notificationsubContent}>
        <img src={profilePicture} alt="User" className={styles.userImage} />
        <p>{user.content}</p>
      </div>
      <div className={styles.dateTime}>{dateTime}</div>
    </div>
  );
};


const GroupInvitation: React.FC<{ user: Notification; setNotificationsCount: React.Dispatch<React.SetStateAction<number>> }> = ({ user, setNotificationsCount  }) => {
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null); // State to track if the request is accepted or rejected
  const profilePicture = user?.notifyingImage ? `${basePath}${user.notifyingImage}` : profileImage.src;
  const router = useRouter();
  const handleClick = () => {
  
    markNotificationsAsRead(setNotificationsCount);
    
    // Navigate to the desired route
    router.push(`/groups/${user.object}`);
  };
  const handleResponse = async (responseType: 'accept' | 'decline') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/group-requests`, { 
        method: 'POST',
          credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notifyingUserId: user.notifyingUserId,
          notifiedUserId: user.notifiedUserId,
          groupId: user.objectId, 
          action: responseType, 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send response');
      }

      const result = await response.json();
      console.log('Response from server:', result);

      // Update the state based on the response
      if (responseType === 'accept') {
        setIsAccepted(true);
      } else {
        setIsAccepted(false);
      }
    } catch (error) {
      console.error('Error handling group request:', error);
    }
  };

  const timestamp = user.createdAt;
  const dateTime = new Date(timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium' });


  return (
    <div className={styles.notificationContent}>
       <div onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className={styles.notificationsubContent}>
        <img src={profilePicture} alt="User" className={styles.userImage} />
        <p>{user.content}</p> 
      </div>
      <div className={styles.dateTime}>{dateTime}</div>
      </div>
      <div className={styles.actionButtons}>
        {isAccepted === null ? ( // If isAccepted is null, show buttons
          <>
            <button className={styles.acceptButton} onClick={() => handleResponse('accept')}>Accept</button>
            <button className={styles.declineButton} onClick={() => handleResponse('decline')}>Decline</button>
          </>
        ) : isAccepted ? ( // If accepted, show accepted message
          <button className={styles.acceptButton}>Accepted</button>
        ) : ( // If rejected, show rejected message
          <button className={styles.declineButton}>Declined</button>
        )}
      </div>
  
    </div>
  );
};

const GroupJoinRequest: React.FC<{ request: Notification; setNotificationsCount: React.Dispatch<React.SetStateAction<number>> }> = ({ request, setNotificationsCount  }) => {
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null); // State to track if the request is accepted or rejected
  const profilePicture = request?.notifyingImage ? `${basePath}${request.notifyingImage}` : profileImage.src;
  const router = useRouter();
  const handleClick = () => {
  
    markNotificationsAsRead(setNotificationsCount);
    
    // Navigate to the desired route
    router.push(`/groups/${request.object}`);
  };
  const handleResponse = async (responseType: 'accept' | 'decline') => {
    const groupId = request.objectId; // Group ID from the request object
    const userId = request.notifyingUserId; // User ID from the request object
    const endpoint = responseType === 'accept' 
      ? `${API_BASE_URL}/api/group/invite/accept?group_id=${groupId}&user_id=${userId}` 
      : `${API_BASE_URL}/api/group/invite/reject?group_id=${groupId}&user_id=${userId}`;

    try {
      const response = await fetch(endpoint, { 
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // No need to send a body if parameters are in the URL
      });

      if (!response.ok) {
        throw new Error('Failed to send response');
      }

      // Update the state based on the response type
      setIsAccepted(responseType === 'accept'); // Set to true if accepted, false if declined

    } catch (error) {
      console.error('Error handling group request:', error);
    }
  };

  const timestamp = request.createdAt;
  const dateTime = new Date(timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium' });

  return (
    <div className={styles.notificationContent}>
      <div onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className={styles.notificationsubContent}>
        <img src={profilePicture} alt="User" className={styles.userImage} />
        <p>{request.content}</p> 
      </div>
      <div className={styles.dateTime}>{dateTime}</div>
      </div>
      <div className={styles.actionButtons}>
        {isAccepted === null ? ( // If isAccepted is null, show buttons
          <>
            <button className={styles.acceptButton} onClick={() => handleResponse('accept')}>Accept</button>
            <button className={styles.declineButton} onClick={() => handleResponse('decline')}>Decline</button>
          </>
        ) : isAccepted ? ( // If accepted, show accepted message
          <button className={styles.acceptButton}>Accepted</button>
        ) : ( // If rejected, show rejected message
          <button className={styles.declineButton}>Declined</button>
        )}
      </div>
    </div>
  );
};



export default Notifications;
