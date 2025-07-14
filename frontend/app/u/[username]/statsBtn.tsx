"use client"
import React, { useEffect, useRef, useState } from "react";
import styles from "./Style/statsBtn.module.css";
import UsersList from "../../components/usersList";
import { API_BASE_URL } from "../../config";

interface UserType {
  id: number;
  username: string;
  profileImg: string;
}

interface StatsBtnProps {
  userData: any;
  followersCount: number;
  setFollowersCount: React.Dispatch<React.SetStateAction<number>>;
  postCount: number;
}

const StatsBtn: React.FC<StatsBtnProps> = ({ userData, followersCount, setFollowersCount, postCount }) => {
  const [openList, setOpenList] = useState<string | null>(null);
  const [followingData, setFollowingData] = useState<UserType[]>([]);
  const [followersData, setFollowersData] = useState<UserType[]>([]);
  const buttonRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFollowingAndFollowers = async () => {
      try {
        const followingResponse = await fetch(`${API_BASE_URL}/api/Following/${userData.username}`);
        if (followingResponse.ok) {
          const followingData = await followingResponse.json();
          setFollowingData(followingData);
        } else {
          console.error("Failed to fetch following data");
        }

        const followersResponse = await fetch(`${API_BASE_URL}/api/Followers/${userData.username}`);
        if (followersResponse.ok) {
          const followersData = await followersResponse.json();
          setFollowersData(followersData);
        } else {
          console.error("Failed to fetch followers data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (userData.username) {
      fetchFollowingAndFollowers();
    }
  }, [userData.username]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setOpenList(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleButtonClick = (list: string) => {
    if (openList === list) {
      setOpenList(null);
    } else {
      setOpenList(list);
    }
  };

  return (
    <div className={styles.profileStats}>
      <div className={styles.stat}>
        <div className={styles.statLabel}>Posts</div>
        <div className={styles.statValue}>{postCount}</div>
      </div>
      <div
        ref={buttonRef}
        className={styles.stat}
        onClick={() => handleButtonClick("Following")}
      >
        <div className={styles.statLabel}>Following</div>
        <div className={styles.statValue}>{userData.following}</div>
      </div>
      <div
        ref={buttonRef}
        className={styles.stat}
        onClick={() => handleButtonClick("Followers")}
      >
        <div className={styles.statLabel}>Followers</div>
        <div className={styles.statValue}>{followersCount}</div>
      </div>
      {openList && (
        <div ref={modalRef} className={styles.usersListContainer}>
          <UsersList
            users={openList === "Following" ? followingData : followersData}
            selectable={false}
          />
        </div>
      )}
    </div>
  );
};

export default StatsBtn;

const UsersListContainer = ({
  users,
  setCheckedUserIds,
  onClose, // Add onClose prop to handle closing
}: {
  users: UserType[];
  setCheckedUserIds: (ids: number[]) => void;
  onClose: () => void; // Define the onClose function type
}) => {
  const containerRef = useRef<HTMLDivElement>(null); // Create a ref for the container

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose(); // Call onClose if clicked outside
      }
    };

    // Add event listener for clicks
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className={styles.usersListContainer} ref={containerRef}>
      <UsersList users={users} setCheckedUserIds={setCheckedUserIds} />
    </div>
  );
};
