import React, { useState } from "react";
import styles from "./Style/user.module.css";
import { API_BASE_URL } from "../config";
//import ProfileImage from "./Images/ProfileImage.png";

interface UserProps {
  username: string;
  profileImg: string; 
  isChecked: boolean; 
  toggleCheck: () => void; // Function to toggle the check state
}

const User = ({ username, profileImg, isChecked, toggleCheck }: UserProps) => {
 const basePath = `${API_BASE_URL}/images?imageName=`;

  return (
    <div className={styles.userItem} onClick={toggleCheck}>
      <img
        src={`${basePath}${profileImg}`}
        alt="User profile"
        className={styles.profileImg}
      />
      <p className={styles.username}>{username}</p>
      <div className={styles.tickContainer} >
        {isChecked && ( // Conditionally render the tick icon based on isChecked
          <svg
            className={styles.tickIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.25 17.292l-4.5-4.364 1.857-1.858 2.643 2.506 5.643-5.784 1.857 1.857-7.5 7.643z" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default User;
