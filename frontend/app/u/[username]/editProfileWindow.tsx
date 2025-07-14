"use client";
import React, { useState, useRef, useEffect } from 'react';
import styles from "../../auth/auth.module.css";
import styles2 from "./Style/editProfileWindow.module.css";
import styles3 from '../../home/Style/createGroup.module.css'
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '../../config';

interface EditProfileWindowProps {
  userData: any;
  onClose: () => void;
  onUpdate: (updatedData: any) => void;
}

const editProfileWindow: React.FC<EditProfileWindowProps> = ({ userData, onClose, onUpdate }) => {
  const router = useRouter();
  const [firstName, setFirstName] = useState(userData.firstName);
  const [lastName, setLastName] = useState(userData.lastName);
  const [nickname, setNickname] = useState(userData.nickname);
  const [dateOfBirth, setDateOfBirth] = useState<string>(
    userData.dateOfBirth ? userData.dateOfBirth.split("T")[0] : ''
  );
  const [aboutMe, setAboutMe] = useState(userData.aboutMe || '');
  const basePath = `${API_BASE_URL}/images?imageName=`;
  const defaultAvatarUrl = `${basePath}ProfileImage.png`;
  const [avatarUrl, setAvatarUrl] = useState(userData.avatarUrl);
  const [isAvatarDeleted, setIsAvatarDeleted] = useState(false);
  const [password, setPassword] = useState('');
  const [isPublic, setIsPublic] = useState(userData.isPublic);
  const [fileName, setFileName] = useState<string>(''); // Add state for file name

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(userData.avatarUrl ? `${basePath}${userData.avatarUrl}` : defaultAvatarUrl);

  useEffect(() => {
    if (!userData.avatarUrl) {
      setAvatarUrl(defaultAvatarUrl); // Set default avatar URL if none is provided
    }
  }, [userData.avatarUrl, basePath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is at least 18 years old
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      alert("You must be at least 18 years old to use this service.");
      return;
    }

    if (!firstName || !lastName || !dateOfBirth || !password) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!nickname.trim()) {
      setNickname("");
    }
    if (!aboutMe) {
      setAboutMe("");
    }
    if (!isPublic) {
      setIsPublic(false);
    }

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("nickname", nickname);
    formData.append("dateOfBirth", dateOfBirth);
    formData.append("aboutMe", aboutMe);
    formData.append("password", password);
    formData.append("isPublic", isPublic.toString());
    formData.append("isAvatarDeleted", isAvatarDeleted.toString());

    if (selectedImage) {
      formData.append("profileImg", selectedImage);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/update`, {
        method: 'POST',
        credentials: 'include',
        body: formData, // Send FormData directly
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      onUpdate(data);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    router.push(`/u/${userData.username}`);

  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);

      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleDeleteAvatar = () => {
    setAvatarUrl('');
    setIsAvatarDeleted(true);
  };

  // Clean up the object URL when the component unmounts or when the selected image changes
  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className={styles3.modalOverlay}>
      <div className={styles3.modalContent}>
        <form className={styles2.container} onSubmit={handleSubmit}>
          <div className={styles.profileContainer}>
            <div className={styles.plusSVG}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="var(--primary-color)"
                  filter="url(#shadow)"
                />
                <path
                  d="M12 7v10M7 12h10"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <label
              htmlFor="profileImageInput"
              className={styles.imageContainer}
            >
              <img
                src={previewUrl}
                alt="Avatar"
                className={styles.ProfileImage}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                id="profileImageInput"
                name="profileImg"
                accept="image/*"
                style={{ display: "none" }}
              />
              {avatarUrl && (
                <button type="button" onClick={handleDeleteAvatar} className={`${styles.plusSVG} ${styles2.deleteAvatarBtn}`}>
                  X
                </button>
              )}
            </label>
          </div>
          <div className={styles.errorMessage}> error </div>
          <div className={styles2.content}>
            <div className={styles.twoInputsContainer}>
              <div className={styles.inputContainer}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  height="12"
                  width="12"
                  className={styles.inputIcon}
                >
                  <path d="M8 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <input
                  type="text"
                  placeholder="Nickname"
                  name="nickname"
                  value={nickname} onChange={(e) => setNickname(e.target.value)}
                  className={styles.inputField}
                />
              </div>
              <div className={styles.inputContainer}>
                <input
                  type="date"
                  placeholder="Date of Birth"
                  name="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)} // Keep the format as YYYY-MM-DD
                  required
                  className={`${styles.inputField} ${styles.date}`}
                />
              </div>
            </div>

            <div className={styles.twoInputsContainer}>
              <div className={styles.inputContainer}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  height="12"
                  width="12"
                  className={styles.inputIcon}
                >
                  <path d="M8 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <input
                  type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                  placeholder="First Name"
                  name="firstName"
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputContainer}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  height="12"
                  width="12"
                  className={styles.inputIcon}
                >
                  <path d="M8 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <input
                  type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required
                  placeholder="Last Name"
                  name="lastName"
                  className={styles.inputField}
                />
              </div>
            </div>
            <div className={styles.inputContainer}>
              <svg
                viewBox="0 0 16 16"
                height="16"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.inputIcon}
              >
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
              </svg>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                placeholder="Password"
                name="password"
                className={styles.inputField}
              />
            </div>

            <div className={styles2.inputsContainer}>
              <textarea
                className={styles2.textArea}
                value={aboutMe} onChange={(e) => setAboutMe(e.target.value)}
                placeholder="About Me"
                name="aboutMe"
              />
              <div className={styles2.privacyOptions}>
                <p className={styles2.PrivacyTitle}>Account Privacy Options</p>
                <div className={styles2.radioBtns}>
                  <div>
                    <input
                      type="radio"
                      className={styles2.radio}
                      name="isPublic"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(true)}
                    />
                    Public
                  </div>
                  <div>
                    <input
                      type="radio"
                      className={styles2.radio}
                      name="isPublic"
                      checked={!isPublic}
                      onChange={(e) => setIsPublic(false)}
                    />
                    Private
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div className={styles2.BtnsContainer}>
            <button type="submit" className={styles.submitBtn}>
              Save Changes
            </button>
            <button type="button" className={`${styles.submitBtn} ${styles2.cancelBtn}`} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default editProfileWindow;
