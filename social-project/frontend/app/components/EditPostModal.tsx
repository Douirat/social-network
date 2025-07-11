import React, { useState, useEffect, useRef } from 'react';
import styles from '../createpost/createPost.module.css';
import modalStyles from './Style/EditPostModal.module.css';
import { updatePost } from '../api/posts';
import UsersList from "./usersList";
import { API_BASE_URL } from "../config";

interface EditPostModalProps {
  post: any;
  onClose: () => void;
  onUpdate: (updatedPost: any) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onUpdate }) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [privacy, setPrivacy] = useState(post.privacy);
  const [file, setFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState(post.file || '');
  const [followers, setFollowers] = useState([]);
  const [checkedUserIds, setCheckedUserIds] = useState<number[]>(post.viewers || []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const TITLE_MAX_LENGTH = 100;
  const CONTENT_MAX_LENGTH = 3000;

  useEffect(() => {
    if (privacy === "almost_private") {
      fetchFollowers();
    }
  }, [privacy]);

  const fetchFollowers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/followers`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch followers');
      }
      const data = await response.json();
      setFollowers(data);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const handlePrivacyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrivacy(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setExistingImage('');
  };

  const handleClearFile = () => {
    setFile(null);
    setExistingImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('id', post.id.toString());
    formData.append('title', title);
    formData.append('content', content);
    formData.append('privacy', privacy);
    
    if (!file && !existingImage) {
      formData.append('clearFile', 'true');
    } else if (file) {
      formData.append('file', file);
    } else if (existingImage) {
      formData.append('existingImage', existingImage);
    }

    if (privacy === "almost_private") {
      formData.append('checkedUserIds', JSON.stringify(checkedUserIds));
    }

    try {
      const updatedPost = await updatePost(post.id, formData);
      onUpdate(updatedPost);
      onClose();
    } catch (error) {
      console.error("Failed to update post:", error);
    }
  };

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        <h2 className={modalStyles.modalTitle}>Edit Post</h2>
        <form onSubmit={handleSubmit} className={styles.editPost}>
          <input
            className={styles.Title}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            maxLength={TITLE_MAX_LENGTH}
            required
          />
          <div className={styles.ContentImageContainer}>
            <textarea
              className={styles.TextArea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content"
              maxLength={CONTENT_MAX_LENGTH}
              required
            />
            <label
              className={styles.custumFileUpload}
              htmlFor="file"
              style={{
                backgroundImage: file ? `url(${URL.createObjectURL(file)})` : existingImage ? `url(${API_BASE_URL}/images?imageName=${existingImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className={styles.icon}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="" viewBox="0 0 24 24">
                  <g strokeWidth="0" id="SVGRepo_bgCarrier"></g>
                  <g strokeLinejoin="round" strokeLinecap="round" id="SVGRepo_tracerCarrier"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path fill="var(--SVG-color)" d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z" clipRule="evenodd" fillRule="evenodd"></path>
                  </g>
                </svg>
              </div>
              <div className={styles.text}>
                <span>{file ? file.name : existingImage || 'Click to upload image'}</span>
              </div>
              <input type="file" id="file" onChange={handleFileChange} ref={fileInputRef} />
              {(file || existingImage) && (
                <button type="button" className={styles.Clear} onClick={handleClearFile}>
                  Clear
                </button>
              )}
            </label>
          </div>
          {!post.group && (
            <>
              <p className={styles.PrivacyTitle}>Privacy options</p>
              <div className={styles.Privacy}>
                <div>
                  <input
                    type="radio"
                    className={styles.radio}
                    name="privacy"
                    checked={privacy === "public"}
                    onChange={handlePrivacyChange}
                    value="public"
                  />
                  Public
                </div>
                <div>
                  <input
                    type="radio"
                    className={styles.radio}
                    name="privacy"
                    checked={privacy === "private"}
                    onChange={handlePrivacyChange}
                    value="private"
                  />
                  Private
                </div>
                <div>
                  <input
                    type="radio"
                    className={styles.radio}
                    name="privacy"
                    value="almost_private"
                    checked={privacy === "almost_private"}
                    onChange={handlePrivacyChange}
                  />
                  Almost Private
                  {privacy === "almost_private" && (
                    <div className={styles.usersListContainer}>
                      <UsersList 
                        users={followers} 
                        setCheckedUserIds={setCheckedUserIds} 
                        initialCheckedIds={checkedUserIds}
                        selectable={true} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          <div className={modalStyles.buttonGroup}>
            <button type="submit" className={modalStyles.updateButton}>Update</button>
            <button type="button" onClick={onClose} className={modalStyles.cancelButton}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;