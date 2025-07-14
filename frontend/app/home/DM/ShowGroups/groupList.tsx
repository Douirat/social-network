import React, { useEffect, useState } from "react";
import styles from "../../Style/chatList.module.css";
import GroupDetails from "./groupDetails";
import { fetchGroups } from "@/app/api/group/details";
import { API_BASE_URL } from "@/app/config";

interface GroupProps {
  group: {
    id: number;
    title: string;
    description: string;
    image: string;
    creator_id: number;
    members: {
      id: number;
      username: string;
      profileImage: string;
    };
  };
}

const GroupsList = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const getGroups = async () => {
      try {
        const data = await fetchGroups(); // Fetch groups from the API
        setGroups(data); // Set the fetched groups to state
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    getGroups(); // Call the function to fetch groups
  }, []);

  return (
    <div className={styles.chatList}>
      {groups?.map((group, index) => (
        <Group key={index} group={group} />
      ))}
    </div>
  );
};

const Group: React.FC<GroupProps> = ({ group }) => {
  const [isViewGroupVisible, setIsViewGroupVisible] = useState(false);

  const showGroupDetails = () => {
    setIsViewGroupVisible(true);
  };

  const hideGroupDetails = () => {
    setIsViewGroupVisible(false);
  };

  const profilePicture = group?.image
    ? `${API_BASE_URL}/images?imageName=${group.image}`
    : `${API_BASE_URL}/images?imageName=ProfileImage.png`;

  return (
    <div className={styles.chatItem}>
      {isViewGroupVisible && (
        <GroupDetails group={group} onClose={hideGroupDetails} />
      )}
      <div className={styles.profileContainer}>
        <img src={profilePicture} className={styles.profilePic} />
      </div>
      <div className={styles.chatInfo}>
        <h3>{group.title}</h3>
      </div>
      <button className={styles.viewButton} onClick={showGroupDetails}>
        <span>view</span>
      </button>
    </div>
  );
};
export default GroupsList;