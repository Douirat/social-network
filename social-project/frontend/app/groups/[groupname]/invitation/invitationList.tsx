import React, { useEffect, useState } from "react";
import styles from "../../../home/Style/createGroup.module.css";
import styles2 from "../../../home/Style/chatList.module.css";
import styles3 from "../Styles/invitation.module.css";
import ProfileImage from "../../../../../backend/pkg/db/uploads/ProfileImage.png";
import Search from "../../../components/search";
import { API_BASE_URL } from "../../../config"
import { useParams } from "next/navigation";
import { cancelInvitation, fetchUsers, inviteUsers } from "../../../api/group/invitations";

interface InvitationLisProps {
  onClose: () => void;
}

interface UserItem {
  id: number;
  username: string;
  profileImg: string;
}

interface Invitation {
  user: UserItem;
  status: string;
}

const InvitationList: React.FC<InvitationLisProps> = ({ onClose }) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [filteredInvitations, setFilteredInvitations] = useState<Invitation[]>([]);
  const { groupname } = useParams();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers(groupname as string);
        setInvitations(data);
        setFilteredInvitations(data); // Initialize filtered invitations
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    loadUsers();
  }, [groupname]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles3.container}>
          <button className={styles.closeButton} onClick={onClose}>
            X
          </button>
          <div className={styles3.listContainer}>
            <Search
              users={invitations?.map(invitation => invitation.user)}
              setFilteredUsers={(filteredUsers) => {
                setFilteredInvitations(
                  invitations.filter(invitation =>
                    filteredUsers.some(user => user.id === invitation.user.id)
                  )
                );
              }}
            />
            <div className={styles3.invitationList}>
              {filteredInvitations && filteredInvitations.length > 0 ? (
                filteredInvitations.map((invitation) => (
                  <User key={invitation.user.id} user={invitation.user} status={invitation.status} />
                ))
              ) : (
                <p>No users found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationList;

const User: React.FC<{ user: UserItem; status: string }> = ({ user, status }) => {
  const [isPending, setIsPending] = useState(false);
  const { groupname } = useParams();

  // Use useEffect to set isPending based on status
  useEffect(() => {
    setIsPending(status === "Pending");
  }, [status]); // Only run when status changes

  const handleInvite = async () => {
    setIsPending(true);
    try {
      await inviteUsers([user.id], groupname as string);
    } catch (error) {
      console.error('Error sending invite:', error);
    }
  };

  const handleCancel = async () => {
    setIsPending(false);
    try {
      await cancelInvitation(user.id, groupname as string);
    } catch (error) {
      console.error('Error canceling invitation:', error);
    }
  };

  console.log(user, status === "Pending", isPending)
  const profilePicture = user?.profileImg ? `${API_BASE_URL}/images?imageName=${user.profileImg}`
    : `${API_BASE_URL}/images?imageName=ProfileImage.png`;

  return (
    <div className={styles2.chatItem}>
      <div className={styles2.profileContainer}>
        <img src={profilePicture} className={styles2.profilePic} />
        <div className={styles2.status}></div>
      </div>
      <div className={styles2.chatInfo}>
        <h3>{user.username}</h3>
      </div>
      {isPending ? <PendingBtn onClick={handleCancel} /> : <InviteUserBtn onClick={handleInvite} />}
    </div>
  );
};

const InviteUserBtn: React.FC<{ onClick: () => void }> = ({ onClick }) => { // Accept onClick prop
  return (
    <button className={`${styles3.inviteBtn} ${styles3.Btn}`} onClick={onClick}> {/* Moved onClick here */}
      <span>Invite</span>
    </button>
  );
};

const PendingBtn: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button className={`${styles3.pendingBtn} ${styles3.Btn}`} onClick={onClick}>
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
