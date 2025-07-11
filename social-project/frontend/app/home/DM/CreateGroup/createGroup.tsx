"use client";
import React, { useState, useEffect } from "react";
import styles from "../../Style/createGroup.module.css";
import User from "../../../components/userItem";
import Search from "../../../components/search";
import { API_BASE_URL } from "../../../config";
import {UserType} from "../../../components/usersList";
import profileImage from "../../../components/Images/ProfileImage.png";
import Member from './member'

interface CreateGroupProps {
  onClose: () => void;
}

const basePath = `${API_BASE_URL}/images?imageName=`;

const createGroup: React.FC<CreateGroupProps> = ({ onClose }) => {

  const [groupImage, setGroupImage] = useState<File | null>(null); // State for group image
  const [groupTitle, setGroupTitle] = useState<string>(''); // State for group title
  const [groupDescription, setGroupDescription] = useState<string>(''); // State for group description
  const [previewUrl, setPreviewUrl] = useState<string>(profileImage.src);

  const MAX_TITLE_LENGTH = 32;
  const MAX_DESCRIPTION_LENGTH = 200;
  const [showTitleWarning, setShowTitleWarning] = useState(false);
  const [showDescriptionWarning, setShowDescriptionWarning] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    if (newTitle.length <= MAX_TITLE_LENGTH) {
      setGroupTitle(newTitle);
      setShowTitleWarning(newTitle.length === MAX_TITLE_LENGTH);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    if (newDescription.length <= MAX_DESCRIPTION_LENGTH) {
      setGroupDescription(newDescription);
      setShowDescriptionWarning(newDescription.length === MAX_DESCRIPTION_LENGTH);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get the first selected file
    if (file) {
      setGroupImage(file); // Set the group image state
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string); // Set the preview URL if needed
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };

  const handleCreateGroup = async () => {
    if (groupTitle.includes("/")) {
      alert('Group title cannot contain "/" character.');
      return; // Exit the function early
  }
    const formData = new FormData();
    if (groupImage) {
      formData.append('image', groupImage); // Append the group image
    }
    formData.append('title', groupTitle); // Append the group title
    formData.append('description', groupDescription); // Append the group description
    formData.append('members', JSON.stringify(checkedUsers)); // Append the members list
    if (!groupTitle.trim() || !groupDescription.trim() || (checkedUsers.length === 0)) {
      alert('Please Fill the group title, description and members Feild');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/group/create`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (response.status === 409) {
        alert('A group with this name already exists. Please choose a different name.');
        return; // Exit the function early
      }
      if (!response.ok) {
        throw new Error('Failed to create group');
      }
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);

    }
  };

  const [users, setUsers] = useState<UserType[]>([]);
  const [checkedUsers, setCheckedUsers] = useState<number[]>([]); // Array to track checked user IDs
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>(users); // State for filtered users
  const [checkedUserIds, setCheckedUserIds] = useState<number[]>([]);

  const toggleUserCheck = (userId: number) => {
    setCheckedUsers((prev) => {
      const newCheckedUsers = prev.includes(userId)
        ? prev.filter((id) => id !== userId) // If already checked, remove it
        : [...prev, userId]; // If not checked, add it

      return newCheckedUsers;
    });
  };

  // Update parent state in useEffect to avoid setState during render
  useEffect(() => {
    setCheckedUserIds(checkedUsers);
  }, [checkedUsers, setCheckedUserIds]);

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
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.container}>
          <button className={styles.closeButton} onClick={onClose}>
            X
          </button>
          <div className={styles.infoContainer}>
            <div className={styles.groupInfo}>
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
              <input
                type="text"
                placeholder="Group Title"
                className={styles.groupTitle}
                value={groupTitle}
                onChange={handleTitleChange}
                maxLength={MAX_TITLE_LENGTH}
              />
              {showTitleWarning && (
                <div className={styles.warningText}>
                  Character limit reached ({groupTitle.length}/{MAX_TITLE_LENGTH})
                </div>
              )}
            </div>

            <textarea
              placeholder="Group Description"
              className={styles.groupDescription}
              value={groupDescription}
              onChange={handleDescriptionChange}
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
            {showDescriptionWarning && (
              <div className={styles.warningText}>
                Character limit reached ({groupDescription.length}/{MAX_DESCRIPTION_LENGTH})
              </div>
            )}

            <div className={styles.invitationSection}>
              <p>Members</p>
              <div className={styles.inviteeList}>
                {checkedUsers.map((userId) => {
                  const user = users.find((u) => u.id === userId); // Find the user object by ID
                  return user ? ( // Check if user exists
                    <Member
                      key={userId}
                      username={user.username}
                      profileImg={user.profileImg}
                      userId={userId} // Pass userId to Member
                      toggleCheck={toggleUserCheck} // Pass toggleCheck function
                    />
                  ) : null; // Return null if user is not found
                })}
              </div>
            </div>
            <button className={styles.createButton} onClick={handleCreateGroup}>Create Group</button> {/* Call create group function */}
          </div>

          <div className={styles.invitationList}>
            <h3>Invite</h3>
            <Search users={users} setFilteredUsers={setFilteredUsers} /> {/* Pass users and setter to Search */}
            <div className={styles.usersList}>
              {filteredUsers.map((user) => (
                <User
                  key={user.id}
                  username={user.username}
                  profileImg={user.profileImg}
                  isChecked={checkedUsers.includes(user.id)} // Check if this user is checked
                  toggleCheck={() => toggleUserCheck(user.id)} // Pass the toggle function
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default createGroup;

