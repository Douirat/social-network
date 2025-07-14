import React, { useState } from "react";
import styles from "../../../home/Style/createGroup.module.css";
import styles2 from "../../../createpost/createPost.module.css";
import styles3 from "../Styles/createPost.module.css";
import { createGroupPost } from "../../../api/posts";

interface CreatePostProps {
  onClose: () => void;
  onPostCreated: () => void;
  groupname: string;
}

const CreatePostWindow: React.FC<CreatePostProps> = ({ onClose, onPostCreated, groupname }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("Title", title);
    formData.append("Content", content);
    formData.append("privacy", "public");
    formData.append("groupname", groupname);
    if (file) {
      formData.append("file", file);
    }

    try {
      await createGroupPost(formData);
      onPostCreated();
      onClose();
    } catch (error) {
      console.error("Error creating group post:", error);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.container}>
          <button className={styles.closeButton} onClick={onClose}>
            X
          </button>
          <div className={styles3.infoContainer}>
            <form
              className={styles3.Post}
              onSubmit={handleSubmit}
              encType="multipart/form-data"
            >
              <input
                className={styles2.Title}
                placeholder="Title"
                name="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className={styles2.ContentImageContainer}>
                <textarea
                  className={styles2.TextArea}
                  placeholder="Content"
                  name="Content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <label className={styles2.custumFileUpload} htmlFor="file">
                  <div className={styles2.icon}>
                    {/* SVG icon code */}
                  </div>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <button type="button" className={styles2.Clear} onClick={() => setFile(null)}>
                    Clear
                  </button>
                </label>
              </div>

              <button type="submit" className={styles2.DownloadButton}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="16"
                  width="20"
                  viewBox="0 0 640 512"
                >
                  <path
                    d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-167l80 80c9.4 9.4 24.6 9.4 33.9 0l80-80c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-39 39V184c0-13.3-10.7-24-24-24s-24 10.7-24 24V318.1l-39-39c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9z"
                    fill="white"
                  ></path>
                </svg>
                <span>Share</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostWindow;