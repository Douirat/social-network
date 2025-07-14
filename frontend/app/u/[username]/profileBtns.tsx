"use client"
import React, { useEffect, useState } from 'react'
import styles from "./Style/profileBtns.module.css";
import { useRouter } from 'next/navigation';
import User from "./page";
import { API_BASE_URL } from '../../config';

interface User {
  followState: string;
  id: number;
  isPublic: boolean;
}

const ProfileBtns = ({ userData, setFollowersCount, isOwner, onEditClick, onProfileActionClick }: { 
  userData: User; 
  setFollowersCount: React.Dispatch<React.SetStateAction<number>>; 
  isOwner: boolean; 
  onEditClick: () => void; 
  onProfileActionClick: (newButtonState: string) => void;
}) => {
  const [buttonState, setButtonState] = useState<string>('Follow'); // Default state

  useEffect(() => {
    // Check if userData is loaded and set the button state accordingly
    if (userData) {
      setButtonState(userData.followState); // Set initial state based on userData
    }
  }, [userData]); 

  const handleButtonClick = async () => {
    let newButtonState: 'Follow' | 'Pending' | 'Following';

    if (buttonState === 'Follow') {
      if (userData.isPublic) {
        newButtonState = 'Following';
        setFollowersCount(prevCount => prevCount + 1);
      } else {
        newButtonState = 'Pending';
      }
    } else if (buttonState === 'Pending') {
      newButtonState = 'Follow';
    } else {
      if (buttonState === 'Following') {
        setFollowersCount(prevCount => prevCount - 1);
      }
      newButtonState = 'Follow';
    }

    setButtonState(newButtonState); // Update the button state

    // Send data to the backend
    try {
      const response = await fetch(`${API_BASE_URL}/api/Follow`, {
        method: 'POST', 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followedId: userData.id, 
          buttonState: newButtonState, 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update follow status');
      } 
      onProfileActionClick(newButtonState);
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  return (
    <div>
      {isOwner ? (
        <MyProfileBtns onEditClick={onEditClick} />
      ) : (
        <OthersProfileBtns 
          buttonState={buttonState} 
          onButtonClick={handleButtonClick} 
          userData={userData} 
          onProfileActionClick={onProfileActionClick}
        />
      )}
    </div>
  );
};

export default ProfileBtns;

const FollowBtn = ({ onButtonClick }: { onButtonClick: () => void }) => {
  return (
    <button className={`${styles.btn} ${styles.followBtn}`} onClick={onButtonClick}>
      Follow
    </button>
  );
};

const UnFollowBtn = ({ onButtonClick }: { onButtonClick: () => void }) => {
  return (
    <button className={`${styles.btn} ${styles.unFollowBtn}`} onClick={onButtonClick}>Following</button>
  );
};

const PendingBtn = ({ onButtonClick }: { onButtonClick: () => void }) => {
  return (
    <button className={`${styles.btn} ${styles.pendingBtn}`} onClick={onButtonClick}>
      Pending
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="16"
        height="16"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="var(--text-color)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M12 6v6h6"
          stroke="var(--text-color)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </button>
  );
};

const MyProfileBtns = ({ onEditClick }: { onEditClick: () => void }) => {
  return (
    <div className={styles.profileActions}>
      <button className={`${styles.btn} ${styles.editBtn}`} onClick={onEditClick}>
        Edit <br></br>
        Profile
      </button>
    </div>
  );
};

const OthersProfileBtns = ({ buttonState, onButtonClick, userData , onProfileActionClick }: { buttonState: string; onButtonClick: () => void, userData: User, onProfileActionClick:() => void }) => {
  const router = useRouter();
  const handleMessageClick = () => {
    // Redirect to the chat page
    router.push(`/chat/${userData.username}`);
};

  return (
    <div className={styles.profileActions}>
      {buttonState === 'Follow' && <FollowBtn onButtonClick={onButtonClick} />}
      {buttonState === 'Pending' && <PendingBtn onButtonClick={onButtonClick} />}
      {buttonState === 'Following' && <UnFollowBtn onButtonClick={onButtonClick} />}
      <button 
                className={`${styles.btn} ${styles.messageBtn}`} 
                onClick={handleMessageClick} 
            >
                Message
            </button>
    </div>
  );
};
