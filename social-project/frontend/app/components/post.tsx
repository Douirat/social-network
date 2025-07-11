/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import styles from "./Style/post.module.css";
import ProfileImage from "./Images/ProfileImage.png";
import Comment from "./comment";
import GeneralPost from "./generalPost";
import { fetchPost, addComment } from '../api/posts';
import Link from 'next/link';

interface PostProps {
  id: string;
}

interface PostType {
  id: number;
  user: {
    id: number;
    username: string;
    avatarUrl: string;
  };
  title: string;
  content: string;
  file: string;
  privacy: string;
  created_at: string;
  comments?: CommentType[];
  reactions: { [key: string]: number };
  user_reaction?: { reaction_type_id: number };
}

interface CommentType {
  id: number;
  post_id: number;
  user: {
    id: number;
    username: string;
    avatarUrl: string;
  };
  content: string;
  created_at: string;
}

const Post: React.FC<PostProps> = ({ id }) => {
  const [post, setPost] = useState<PostType | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const COMMENT_MAX_LENGTH = 100; 
  useEffect(() => {
    const loadPost = async () => {
      setIsLoadingPost(true);
      setError(null);
      try {
        const fetchedPost = await fetchPost(id);
        setPost(fetchedPost);
      } catch (error: any) {
        setError(error.message || 'An unknown error occurred');
      } finally {
        setIsLoadingPost(false);
      }
    };

    loadPost();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const formData = new FormData();
    formData.append('content', newComment);
    formData.append('postId', id);
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      const addedComment = await addComment(formData);
      setPost(prevPost => {
        if (!prevPost) return null;
        const updatedComments = prevPost.comments ? [addedComment, ...prevPost.comments] : [addedComment];
        return { ...prevPost, comments: updatedComments };
      });
      setNewComment("");
      setSelectedFile(null);
      setImagePreviewUrl(null);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImagePreviewUrl(null); // Hide the image preview
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ""; // Reset the file input
    }
  };

  const handleSendComment = () => {
    handleAddComment(new Event('submit')); // Trigger the add comment function
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostUpdate = (updatedPost: any) => {
    setPost(updatedPost);
  };

  if (isLoadingPost) return <div>Loading...</div>;
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h1 className={styles.errorTitle}>Oops! Post Not Found</h1>
          <p className={styles.errorMessage}>{error}</p>
          <Link href="/" className={styles.homeButton}>
            Go to Home Page
          </Link>
        </div>
      </div>
    );
  }
  if (!post) return null;

  return (
    <>
      <div className={styles.post}>
        <GeneralPost 
          post={post} 
          onPostUpdate={handlePostUpdate}
          onPostDelete={() => {}}
        />

        <div className={styles.commentsContainer}>
          <div className={styles.comments}>
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <Comment key={comment.id} comment={comment} />
              ))
            ) : (
              <p className={styles.note}>Be the first to comment</p>
            )}
          </div>
          <div className={styles.commentBox} style={{ position: 'relative' }}>
            <img
              src={ProfileImage.src}
              alt="User"
              className={styles.profilePicture}
            />
            <input
              type="text"
              className={styles.commentInput}
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddComment(e);
                }
              }}
              maxLength={COMMENT_MAX_LENGTH}
            />
            <div className={styles.iconsContainer}>
              <label htmlFor="fileInput" className={styles.AttachmentContainer}>
                <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 24 24" fill="#A0A0A0">
                  <path d="M12 2L8 6h3v6h2V6h3l-4-4zm8 16H4v-2h16v2z" />
                </svg>
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </label>
              <button className={styles.sendButton} onClick={handleSendComment}>
                <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="30.000000pt" height="30.000000pt"
                  viewBox="0 0 35.000000 35.000000" preserveAspectRatio="xMidYMid meet">
                  <g transform="translate(0.000000,30.000000) scale(0.100000,-0.100000)" fill="#A0A0A0" stroke="none">
                    <path
                      d="M44 256 c-3 -8 -4 -29 -2 -48 3 -31 5 -33 56 -42 28 -5 52 -13 52 -16 0 -3 -24 -11 -52 -16 -52 -9 -53 -9 -56 -48 -2 -21 1 -43 6 -48 10 -10 232 97 232 112 0 7 -211 120 -224 120 -4 0 -9 -6 -12 -14z">
                    </path>
                  </g>
                </svg>
              </button>
            </div>
            {imagePreviewUrl && (
              <div className={styles.imagePreviewContainer}>
                <img src={imagePreviewUrl} alt="Preview" className={styles.imagePreview} />
                <button className={styles.closeButton} onClick={handleRemoveFile}>
                  &times;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
