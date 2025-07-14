"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import styles from "../auth/auth.module.css";
import profileImage from "../components/Images/ProfileImage.png";
import { signup, checkAuth } from "../utils/authUtils";
import { AuthContext } from "../auth/AuthProvider";

// Constants matching backend validation
const MAX_USERNAME_LENGTH = 20;
const MIN_USERNAME_LENGTH = 3;
const MAX_PASSWORD_LENGTH = 72;
const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 50;
const MAX_NICKNAME_LENGTH = 30;
const MAX_ABOUTME_LENGTH = 500;
const MAX_EMAIL_LENGTH = 254; 

// Regex patterns matching backend validation
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}$/;

const validateForm = (formData: FormData): string | null => {
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const nickname = formData.get('nickname') as string;
  const dateOfBirth = formData.get('dateOfBirth') as string;

  // Username validation
  if (username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH) {
    return `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`;
  }
  if (!USERNAME_REGEX.test(username)) {
    return 'Username must contain only letters, numbers, underscores, and hyphens';
  }

  // Email validation
  if (email.length > MAX_EMAIL_LENGTH) {
    return `Email must not exceed ${MAX_EMAIL_LENGTH} characters`;
  }
  if (!EMAIL_REGEX.test(email)) {
    return 'Invalid email format';
  }

  // Name validations
  if (!USERNAME_REGEX.test(firstName) || firstName.length > MAX_NAME_LENGTH) {
    return 'First name must contain only letters, numbers, and special characters';
  }
  if (!USERNAME_REGEX.test(lastName) || lastName.length > MAX_NAME_LENGTH) {
    return 'Last name must contain only letters, numbers, and special characters';
  }

  // Nickname validation (if provided)
  if (nickname && (!USERNAME_REGEX.test(nickname) || nickname.length > MAX_NICKNAME_LENGTH)) {
    return 'Nickname must contain only letters, numbers, and special characters';
  }

  // Date of birth validation
  const birthDate = new Date(dateOfBirth);
  const age = (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (isNaN(birthDate.getTime()) || age < 18) {
    return 'User must be at least 18 years old';
  }

  return null;
};

const Page = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(profileImage.src);
  const { setIsLoggedIn, setUser } = useContext(AuthContext);

  const handleLoginClick = () => {
    router.push("/");
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(file);

      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clean up the object URL when the component unmounts or when the selected image changes
  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (selectedImage) {
      formData.append("profileImg", selectedImage);
    }

    const { success, error, user } = await signup(formData);

    if (success && user) {
      setError(null);
      setIsLoggedIn(true);
      setUser(user);
      router.push('/home');
    } else {
      setError(error || "An error occurred during signup");
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { isLoggedIn } = await checkAuth();
      if (isLoggedIn) {
        router.push('/home');
      }
    };

    checkSession();
  }, [router]);

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <div className={styles.container}>
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
                className={styles.ProfileImage}
                alt="Profile"
              />
              <input
                type="file"
                id="profileImageInput"
                name="profileImg"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>
          </div>
          <div className={styles.tabs}>
            <div className={styles.tab} onClick={handleLoginClick}>
              Login
            </div>
            <div className={`${styles.tab} ${styles.active}`}>Sign Up</div>
          </div>
          <div className={styles.errorMessage}>{error}</div>
          <div className={styles.SignupContainer}>
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
                  placeholder="Username"
                  name="username"
                  className={styles.inputField}
                  minLength={MIN_USERNAME_LENGTH}
                  maxLength={MAX_USERNAME_LENGTH}
                  pattern="[a-zA-Z0-9_-]+"
                  title="Username can only contain letters, numbers, underscores, and hyphens"
                  required
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
                  type="text"
                  placeholder="Nickname"
                  name="nickname"
                  className={styles.inputField}
                  maxLength={MAX_NICKNAME_LENGTH}
                  pattern="[a-zA-Z0-9_-]+"
                  title="Nickname can only contain letters, numbers, and special characters"
                />
              </div>
            </div>
            <div className={styles.inputContainer}>
              <svg
                viewBox="0 0 16 16"
                fill="#2e2e2e"
                height="16"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.inputIcon}
              >
                <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"></path>
              </svg>
              <input
                type="email"
                placeholder="Email"
                name="email"
                className={styles.inputField}
                pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}"
                maxLength={MAX_EMAIL_LENGTH}
                title="Please enter a valid email address"
                required
              />
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
                  type="text"
                  placeholder="First Name"
                  name="firstName"
                  className={styles.inputField}
                  maxLength={MAX_NAME_LENGTH}
                  pattern="[a-zA-Z0-9_-]+"
                  title="First name can only contain letters, numbers, and special characters"
                  required
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
                  type="text"
                  placeholder="Last Name"
                  name="lastName"
                  className={styles.inputField}
                  maxLength={MAX_NAME_LENGTH}
                  pattern="[a-zA-Z0-9_-]+"
                  title="Last name can only contain letters, numbers, and special characters"
                  required
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
                type="password"
                placeholder="Password"
                name="password"
                className={styles.inputField}
                minLength={MIN_PASSWORD_LENGTH}
                maxLength={MAX_PASSWORD_LENGTH}
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                title="Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character"
                required
              />
            </div>

            <div className={styles.inputContainer}>
              <input
                type="date"
                placeholder="Date of Birth"
                name="dateOfBirth"
                className={`${styles.inputField} ${styles.date}`}
              />
            </div>
            <div className={styles.inputContainer}>
              <textarea
                className={styles.textArea}
                placeholder="About Me"
                name="aboutMe"
                maxLength={MAX_ABOUTME_LENGTH}
              />
            </div>
          </div>
          <button type="submit" className={styles.submitBtn}>Register</button>
        </div>
      </form>
    </main>
  );
};

export default Page;