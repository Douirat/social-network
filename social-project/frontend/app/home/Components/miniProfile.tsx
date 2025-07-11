"use client";

import React, { useContext } from "react";
import { AuthContext } from "@/app/auth/AuthProvider";
import styles from "@/app/home/Style/miniProfile.module.css";
import ProfileImage from "@/app/components/Images/ProfileImage.png";
import { API_BASE_URL } from "@/app/config";
import { useRouter } from 'next/navigation';

const MiniProfile = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const basePath = `${API_BASE_URL}/images?imageName=`;
  if (!user) return null;

  const profilePicture = user.avatarUrl ? `${basePath}${user.avatarUrl}` : ProfileImage.src;

  return (
    <div className={styles.profileCard}>
      <div className={styles.bannerImage}></div>
      <div className={styles.profileImageContainer}>
        <a href={`/u/${encodeURIComponent(user.username)}`}>
          <img
            src={profilePicture}
            alt={user.username}
            className={styles.profileImage}
          />
        </a>
      </div>
      <div className={styles.profileInfo}>
        <h2
          className={styles.userName}
        >{`${user.firstName} ${user.lastName}`}</h2>
        <p className={styles.userHandle}>@{user.username}</p>
        <p className={styles.userBio}>{user.aboutMe || "No bio available"}</p>
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Following</span>
            <span className={styles.statValue}>{user.following}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Followers</span>
            <span className={styles.statValue}>{user.followers}</span>
          </div>
        </div>
        {user && (
          <div className={styles.profileContainer}>
            <button className={styles.profileButton} onClick={() => router.push(`/u/${encodeURIComponent(user.username)}`)} style={{ cursor: 'pointer' }}>My Profile</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniProfile;
