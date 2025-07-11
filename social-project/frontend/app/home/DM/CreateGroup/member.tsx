"use client";
import React from "react";
import styles from "../../Style/createGroup.module.css";
import { API_BASE_URL } from "../../../config";

const Member: React.FC<{ username: string; profileImg: string; userId: number; toggleCheck: (userId: number) => void }> = ({ username, profileImg, userId, toggleCheck }) => { // Added userId and toggleCheck props
  const profilePicture = profileImg
    ? `${API_BASE_URL}/images?imageName=${profileImg}`
    : `${API_BASE_URL}/images?imageName=ProfileImage.png`;
  return (
    <div className={styles.invitee}>
      <div className={styles.imageContainer}>
        <img
          src={profilePicture}
          alt="User profile"
          className={styles.inviteeProfileImg}
        />
        <button
          className={styles.removeButton}
          onClick={() => toggleCheck(userId)} // Call toggleCheck with userId on button click
        >
          X
        </button>
      </div>
      <p className={styles.inviteeUserName}>{username}</p>

    </div>
  );
};

export default Member