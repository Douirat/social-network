import React, { useState } from "react";
import styles from "../../Style/chatList.module.css";
import GroupDetails from "./groupDetails";
import { API_BASE_URL } from "@/app/config";
import Link from "next/link";

export interface Group {
  id: number;
  title: string;
  description: string;
  image: string;
  creator_id: number;
  members: {
    id: number;
    username: string;
    profileImage: string;
  }[];
}

interface GroupsListProps {
  groups: Group[];
  groupType: 'Created' | 'Joined' | 'Discover';
}

const GroupsList: React.FC<GroupsListProps> = ({ groups, groupType }) => {
  return (
    <div className={styles.chatList}>
      {groups && groups.length > 0 ? (
        groups.map((group) => (
          <Group key={group.id} group={group} groupType={groupType} />
        ))
      ) : (
        <p className={styles.noGroup}>No groups to display</p>
      )}
    </div>
  );
};

const Group: React.FC<{ group: Group; groupType: 'Created' | 'Joined' | 'Discover' }> = ({ group, groupType }) => {
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

  const groupContent = (
    <>
      <div className={styles.profileContainer}>
        <img src={profilePicture} alt={group.title} className={styles.profilePic} />
        <div className={styles.status}></div>
      </div>
      <div className={styles.chatInfo}>
        <h3>{group.title}</h3>
        <p>{group.description}</p>
      </div>
    </>
  );

  return (
    <div className={styles.chatItem}>
      {isViewGroupVisible && (
        <GroupDetails group={group} onClose={hideGroupDetails} groupType={groupType} />
      )}
      {groupType === 'Discover' ? (
        <>
          {groupContent}
          <button className={styles.viewButton} onClick={showGroupDetails}>
            <span>View</span>
          </button>
        </>
      ) : (
        <Link href={`/groups/${encodeURIComponent(group.title)}`}>
          {groupContent}
        </Link>
      )}
    </div>
  );
};

export default GroupsList;
