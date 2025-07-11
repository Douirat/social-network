"use client";

import React from 'react'
import styles from './Style/comment.module.css'
import ProfileImage from "./Images/ProfileImage.png";
import Link from 'next/link';
import { API_BASE_URL } from '../config';

interface CommentProps {
  comment: {
    id: number;
    user: {
      username: string;
      avatarUrl: string;
    };
    content: string;
    file: string;
    created_at: string;
  }
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  console.log(comment)
  return (
    <div className={styles.comment}>
      <div className={styles.avatarContainer}>
        <img
          src={comment.user.avatarUrl ? `${API_BASE_URL}/images?imageName=${comment.user.avatarUrl}` : ProfileImage.src}
          alt="User Avatar"
          className={styles.avatar}
        />
      </div>
      <div className={styles.commentContentContainer}>
        <div className={styles.commentHeader}>
          <Link href={`/u/${encodeURIComponent(comment.user.username)}`}>
            <span className={styles.username}>{comment.user.username}</span>
          </Link>
          <span className={styles.timestamp}>{new Date(comment.created_at).toLocaleString()}</span>
        </div>
        <div className={styles.commentContent}>
          <p>{comment.content}</p>
        </div>
        {comment.file && (
          <div className={styles.fileContainer}>
            <img src={`${API_BASE_URL}/images?imageName=${comment.file}`} alt="Attached file" className={styles.attachedImage} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Comment