import React, { useContext, useState, useEffect } from "react";
import styles from "../../../home/Style/createGroup.module.css"
import styles2 from "../../../home/Style/groupDetails.module.css"
import styles3 from "../Styles/groupPage.module.css"
import styles4 from "../../../home/Style/createGroup.module.css"
import Member from './member'; 
import EditMember from '../../../home/DM/CreateGroup/member'
import { deleteGroup } from '../../../api/group/details'; 
import { useParams } from "next/navigation";
import { AuthContext } from "../../../auth/AuthProvider";
import { NextRouter } from "next/router";
import { API_BASE_URL } from "@/app/config";
import { updateGroup } from '../../../api/group/details';

interface Member {
    id: number;
    username: string;
    profileImg: string; // Updated to match your structure
    image?: string; // Optional field for the updated image URL
}

// Update the GroupInfoProps interface to include the members type
interface GroupInfoProps {
    onClose: () => void;
    group: {
        id: number;
        title: string;
        description: string;
        image: string;
        creator_id: number;
        members: Member[]; // Use the Member type here
    };
    router: NextRouter;
}

const GroupInfo: React.FC<GroupInfoProps> = ({ onClose, group, router }) => {
    const { user } = useContext(AuthContext);
    const { groupname } = useParams();
    console.log(group)

    // State for edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(group.title);
    const [editedDescription, setEditedDescription] = useState(group.description);
    const [editedImage, setEditedImage] = useState<File | null>(null); // State for the image file
    const [members, setMembers] = useState<Member[]>(group.members || []); // Update the members state initialization
    const [previewUrl, setPreviewUrl] = useState<string>(group.image);
    const [removedMemberIds, setRemovedMemberIds] = useState<number[]>([]); // State for removed member IDs

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; // Get the first selected file
        if (file) {
            setEditedImage(file); // Set the group image state
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string); // Set the preview URL if needed
            };
            reader.readAsDataURL(file); // Read the file as a data URL
        }
    };

    const handleDeleteGroup = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete the group?");
        if (confirmDelete) {
            try {
                await deleteGroup(groupname as string); // Call the delete function
                alert("Group deleted successfully.");
                router.push('/home');
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleSaveChanges = async () => {
        const groupData = {
            id: group.id,
            title: editedTitle,
            description: editedDescription,
            image: editedImage, // You may need to handle the image upload separately
            removedMembers: removedMemberIds, // Send only the removed member IDs
        };

        try {
            await updateGroup(groupData); // Call the new fetch function
            alert("Group updated successfully.");
            setIsEditing(false);
            if (editedTitle === group.title) {
                window.location.reload();
            } else {
                router.push(`/groups/${editedTitle}`);
            }
        } catch (error) {
            alert("Error updating group: " + error.message);
        }
    };

    const handleRemoveMember = (memberId: number) => {
        const confirmRemove = window.confirm("Are you sure you want to remove this member?");
        if (confirmRemove) {
            // Add the member ID to the removedMemberIds array
            setRemovedMemberIds([...removedMemberIds, memberId]);
            // Remove the member from the list
            setMembers(members.filter(member => member.id !== memberId));
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles2.container}>
                    <button className={styles.closeButton} onClick={onClose}>
                        X
                    </button>
                    <div className={styles2.infoContainer}>
                        <div className={styles.groupInfo}>
                            {isEditing ? (
                                <div className={styles.groupImage}>
                                    <label htmlFor="groupImageInput" style={{ cursor: "pointer" }}>

                                        <img src={previewUrl} alt="Group" />
                                        <input
                                            id="groupImageInput"
                                            type="file"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            style={{ display: "none" }}
                                        />

                                    </label>
                                </div>
                            ) : (
                                <div className={styles.groupImage}>
                                    <img src={editedImage ? URL.createObjectURL(editedImage) : group.image} alt={editedTitle} />
                                </div>
                            )}
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    placeholder="Group Title"
                                    className={styles2.groupTitle}
                                />
                            ) : (
                                <p className={styles2.groupTitle}>{editedTitle}</p>
                            )}
                        </div>

                        {isEditing ? (
                            <textarea
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
                                placeholder="Group Description"
                                className={styles4.groupDescription}
                            />
                        ) : (
                            <p className={styles2.groupDescription}>
                                {editedDescription}
                            </p>
                        )}

                        <div className={styles.invitationSection}>
                            <p>Members</p>
                            <div className={styles.inviteeList}>
                                {members && members.length > 0 ? (
                                    members.map(member => (
                                        isEditing ? (
                                            member.id === group.creator_id ? ( // Check if the member is the creator
                                                <Member
                                                    key={member.id}
                                                    username={member.username}
                                                    profileImage={member.profileImg}
                                                />
                                            ) : (
                                                <EditMember
                                                    key={member.id}
                                                    username={member.username}
                                                    profileImg={member.profileImg}
                                                    userId={member.id} // Pass userId
                                                    toggleCheck={handleRemoveMember}
                                                />
                                            )
                                        ) : (
                                            <Member
                                                key={member.id}
                                                username={member.username}
                                                profileImage={member.profileImg}
                                            />
                                        )
                                    ))
                                ) : (
                                    <p>No members found</p>
                                )}
                            </div>
                        </div>

                        {user?.id === group.creator_id && (
                            <div className={styles3.btns}>
                                <button className={styles.createButton} onClick={isEditing ? handleSaveChanges : handleEditToggle}>
                                    {isEditing ? "Save Changes" : "Edit Group"}
                                </button>
                                <button
                                    className={`${styles.createButton} ${styles3.deleteBtn}`}
                                    onClick={handleDeleteGroup}
                                >
                                    Delete Group
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupInfo;
