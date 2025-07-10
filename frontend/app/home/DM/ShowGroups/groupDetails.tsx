import styles from "../../Style/createGroup.module.css";
import ProfileImage from "../../../../../backend/pkg/db/uploads/ProfileImage.png";
import styles2 from '../../Style/groupDetails.module.css'
import { API_BASE_URL } from "@/app/config";
import { getGroupDetails } from "@/app/api/group/details";
import React, { useState, useEffect } from "react";
import Member from "../../../groups/[groupname]/info/member"
import PendingBtn from "@/app/u/[username]/profileBtns";

// Add these constants at the top of the file, after imports
const MAX_TITLE_LENGTH = 32;
const MAX_DESCRIPTION_LENGTH = 200;

interface GroupDetailsProps {
  onClose: () => void;
  group: {
    id: number;
    title: string;
    description: string;
    image: string;
    isRequested: boolean;
    creator_id: number;
    members: {
      id: number;
      username: string;
      profileImage: string;
    }[];
  };
  groupType: 'Created' | 'Joined' | 'Discover';
  memberStatus: 'pending' | '';
}

const GroupDetails: React.FC<GroupDetailsProps> = ({ onClose, group, groupType }) => {
  const [groupData, setGroupData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequested, setIsRequested] = useState<boolean>(group.isRequested);
  const [memberStatus, setMemberStatus] = useState<string>(''); // Initial status

  useEffect(() => {
    const loadGroupDetails = async () => {
      try {
        const result = await getGroupDetails(group.title);
        console.log(result)
        if (result.status === 200) {
          if (result.message) {
            // Handle message (e.g., pending invitation or non-member)
            setError(result.message);
          } else if (result.group) {
            // Handle successful group data fetch
            const profilePicture = result.group.group.image
              ? `${API_BASE_URL}/images?imageName=${result.group.group.image}`
              : `${API_BASE_URL}/images?imageName=ProfileImage.png`;
            result.group.image = profilePicture;
            setGroupData(result.group.group);
            setMemberStatus(result.group.member_status);
          }
        } else {
          setError("Failed to load group details");
        }
      } catch (error) {
        console.error("Failed to load group details:", error);
        setError("An error occurred while loading group details");
      } finally {
        setLoading(false);
      }
    };

    loadGroupDetails();
  }, [group.title]);

  const handleButtonClick = async () => {
    // Validate title and description length before sending
    if (groupData.title.length > MAX_TITLE_LENGTH) {
      setError(`Title must not exceed ${MAX_TITLE_LENGTH} characters`);
      return;
    }

    if (groupData.description.length > MAX_DESCRIPTION_LENGTH) {
      setError(`Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters`);
      return;
    }

    // Determine the request type based on the current state
    const requestType = isRequested ? 'unjoin' : 'join'; // 'unjoin' if currently requested, otherwise 'join'
    console.log(requestType)
    // Prepare the request body
    const requestBody = {
      group: groupData, // Include existing group data as a separate field
      requestType,      // Add the request type
    };
    console.log(requestBody);

    // Send the request to the same URL
    const response = await fetch(`${API_BASE_URL}/api/group-joinRequests`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Failed to send response');
    }


    // Toggle the request state based on the action performed
    setIsRequested(!isRequested);
    if (requestType === 'join') {
      // If joining, set memberStatus to 'pending'
      setMemberStatus('pending');
    } else {
      // If unjoining, set memberStatus to an empty string or appropriate value
      setMemberStatus(''); // or memberStatus('not_a_member') if you have that status
    }
  };

  const groupPicture = groupData?.image
      ? `${API_BASE_URL}/images?imageName=${groupData.image}`
      : `${API_BASE_URL}/images?imageName=ProfileImage.png`;

  console.log(groupData);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles2.container}>
          <button className={styles.closeButton} onClick={onClose}>
            X
          </button>
          <div className={styles2.infoContainer}>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div>{error}</div>
            ) : groupData ? (
              <>
                <div className={styles.groupInfo}>
                  <div className={styles.groupImage}>
                    <img src={groupPicture} alt={groupData.title} />
                  </div>
                  <p className={styles2.groupTitle}>{groupData.title}</p>
                </div>
                <p className={styles2.groupDescription}>
                  {groupData.description}
                </p>
                <div className={styles.invitationSection}>
                  <p>Members</p>
                  <div className={styles.inviteeList}>
                    {groupData?.members?.map((member: { id: string; username: string; profileImage: string }) => (
                      <Member key={member.id} username={member.username} profileImage={member.profileImage} />
                    ))}
                  </div>
                </div>
                {memberStatus === 'pending' ? (
                  <button className={`${styles.createButton} ${styles.pendingBtn}`} onClick={handleButtonClick} disabled={loading}>
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
                ) : (
                  <button className={styles.createButton} onClick={handleButtonClick} disabled={loading}>
                    Join Group
                  </button>
                )}
              </>
            ) : (
              <div>No group data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
