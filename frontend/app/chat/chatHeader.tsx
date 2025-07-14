"use client"
import React, { useState, useEffect, useCallback } from "react";
import styles from "./Style/chat.module.css";
import { API_BASE_URL } from "@/app/config";
import { UserType } from "../components/usersList";

const ChatHeader: React.FC<{ userB: UserType; isOnline?: boolean }> = ({ userB, isOnline = false }) => {
    return (
        <div className={styles.chatHeader}>
            <div className={styles.userInfo}>
                <div className={styles.profileContainer}>
                    <img
                        src={userB && userB.profileImg ? `${API_BASE_URL}/images?imageName=` + userB.profileImg : "https://via.placeholder.com/40"}
                        alt="Profile"
                        className={styles.profilePic}
                    />
                    <div className={`${styles.status} ${isOnline ? styles.online : ''}`}></div>
                </div>
                <span className={styles.username}>{userB && userB.username ? userB.username : null}</span>
            </div>
        </div>
    )
}

export default ChatHeader;
