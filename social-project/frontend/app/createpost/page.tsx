"use client";
import React, { useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import style from "./createPost.module.css";
import Nav from "../components/nav";
import UsersList from "../components/usersList";
import Notifications from "../components/notifications";
import { API_BASE_URL } from "../config";



// Define UserType interface
export interface UserType {
  id: number; 
  username: string; 
  profileImg: string; 
}


const page = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [privacyOption, setPrivacyOption] = useState("public");
  const [users, setUsers] = useState<UserType[]>([]);
  const [checkedUserIds, setCheckedUserIds] = useState<number[]>([]); // State to track checked user IDs
  const [file, setFile] = useState<File | null>(null); // State to hold the uploaded file
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Create a ref for the file input
  const [title, setTitle] = useState(""); // State for title
  const [content, setContent] = useState(""); // State for content

  const TITLE_MAX_LENGTH = 100;
  const CONTENT_MAX_LENGTH = 3000;

  const handlePrivacyChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPrivacyOption(value);

    if (value === "almost_private") {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          credentials: 'include', 
      }); // Update with your endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data); 

      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null; // Get the selected file
    setFile(selectedFile); // Update the state with the selected file
  };

  const handleClearFile = () => {
    setFile(null); // Clear the file state
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input element
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); // Clear any previous errors
    const formData = new FormData(event.currentTarget);

    // Check if all fields are filled except the file attachment
    const title = formData.get("Title")?.toString().trim();
    const content = formData.get("Content")?.toString().trim();
    const privacy = formData.get("privacy")?.toString().trim();

    if (!title || !content || !privacy) {
      alert("The post has to have a Title, Content and Privacy setting");
      return; // Exit if validation fails
    }

    // Append checked user IDs as a single JSON string if privacy is almost-private
    if (privacy === "almost_private") {
      formData.append('checkedUserIds', JSON.stringify(checkedUserIds)); // Append the array as a JSON string
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/post`, {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies in the request
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      // Post created successfully, redirect to home page
      router.push('/home');

    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  return (
    <main>
      <Nav />
      {error && <div className={style.errorMessage}>{error}</div>}
      <form className={style.Post} id="PostForm" encType="multipart/form-data" onSubmit={handleSubmit}>
        <input
          className={style.Title}
          placeholder="Title"
          name="Title"
          value={title} // Bind to title state
          onChange={(e) => setTitle(e.target.value)} // Update title state
          maxLength={TITLE_MAX_LENGTH}
        />
        <div className={style.ContentImageContainer}>
          <textarea
            className={style.TextArea}
            placeholder="Content"
            name="Content"
            value={content} // Bind to content state
            onChange={(e) => setContent(e.target.value)} // Update content state
            maxLength={CONTENT_MAX_LENGTH}
          ></textarea>
          <label
            className={style.custumFileUpload}
            htmlFor="file"
            style={{
              backgroundImage: file ? `url(${URL.createObjectURL(file)})` : 'none', // Set background image if file is uploaded
              backgroundSize: 'cover',
              backgroundPosition: 'center', // Center the background image
            }}
          >
            <div className={style.icon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill=""
                viewBox="0 0 24 24"
              >
                <g strokeWidth="0" id="SVGRepo_bgCarrier"></g>
                <g
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  id="SVGRepo_tracerCarrier"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    fill="var(--SVG-color)"
                    d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  ></path>
                </g>
              </svg>
            </div>
            <input type="file" id="file" name="file" onChange={handleFileChange} ref={fileInputRef} />
            <button type="button" className={style.Clear} onClick={handleClearFile}>
              Clear
            </button>
          </label>
        </div>
        <p className={style.PrivacyTitle}> Privacy options</p>
        <div className={style.Privacy}>
          <div>
            <input
              type="radio"
              className={style.radio}
              name="privacy"
              checked={privacyOption === "public"}
              onChange={handlePrivacyChange}
              value="public"
            />
            Public
          </div>
          <div>
            <input
              type="radio"
              className={style.radio}
              name="privacy"
              checked={privacyOption === "private"}
              onChange={handlePrivacyChange}
              value="private"
            />
            Private
          </div>

          <div>
            <input
              type="radio"
              className={style.radio}
              name="privacy"
              value="almost_private"
              checked={privacyOption === "almost_private"}
              onChange={handlePrivacyChange}
              id="almostPrivateRadio"
            />
            Almost Private
            {privacyOption === "almost_private" && (
              <div className={style.usersListContainer}>
                <UsersList 
                  users={users} 
                  setCheckedUserIds={setCheckedUserIds}
                  selectable={true} 
                /> 
              </div>
            )}
          </div>
        </div>
        <button className={style.DownloadButton}>
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
    </main>
  );
};

export default page;
