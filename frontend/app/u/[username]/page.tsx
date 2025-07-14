"use client"

import React, { useState, useEffect } from "react";
import styles from "./Style/profilePage.module.css";
import Nav from "../../components/nav";
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import GeneralPost from "../../components/generalPost";
import StatsBtn from './statsBtn'
import PrivateImage from "../../components/Images/Private.png";
import ProfileBtns from './profileBtns'
import EditProfileWindow from './editProfileWindow';
import { API_BASE_URL } from "../../config";
import { reactToContent } from '../../api/reactions';
import GroupPost from "../../home/Components/groupPost";

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  avatarUrl: string;
  aboutMe: string;
  createdAt: string;
  dateOfBirth: string;
  isPublic: boolean;
  followers: number;
  following: number;
  isFollowed: boolean;
  followState: string;
  postCount: number; // Add this line
}

// Update the defaultUserData to include postCount
const defaultUserData: User = {
  id: 0,
  username: '',
  firstName: ' ',
  lastName: ' ',
  nickname: '-',
  email: ' ',
  avatarUrl: ' ',
  aboutMe: '-',
  createdAt: ' ',
  dateOfBirth: ' ',
  isPublic: true,
  followers: 0,
  following: 0,
  isFollowed: false,
  followState: "",
  postCount: 0, // Add this line
};

const Page = () => {
  const { username } = useParams();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(defaultUserData);
  const [isOwner, setIsOwner] = useState(false);
  const [followState, setFollowState] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Posts');
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followersCount, setFollowersCount] = useState(0);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };
  const basePath = `${API_BASE_URL}/images?imageName=`;

  const handleUpdate = async (updatedData: any) => {
    setUserData(updatedData);
    await fetchUserData();
    setIsModalOpen(false);
  };

  const fetchUserData = async () => {
    if (username) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/${username}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('User not found or has been deleted');
          }
          throw new Error('An error occurred while fetching user data');
        }
        const data = await response.json();
        setUserData(data.user);
        setIsOwner(data.isOwner);
        setFollowState(data.user.followState)
        setFollowersCount(data.user.followers);
      } catch (error: any) {
        setError(error.message || 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchPosts = async () => {
    if (username) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/posts?username=${username}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          if (response.status === 404) {
            setPosts([]);
            return;
          }
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleProfileActionClick = async (newButtonState: string) => {
    setFollowState(newButtonState); // Update isPublic based on newButtonState
  };


  useEffect(() => {
    if (activeTab === 'Posts') {
      fetchPosts();
    }
  }, [activeTab, username]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Nav />
        <div className={styles.errorContent}>
          <h1 className={styles.errorTitle}>Oops! User Not Found</h1>
          <p className={styles.errorMessage}>{error}</p>
          <Link href="/" className={styles.homeButton}>
            Go to Home Page
          </Link>
        </div>
      </div>
    );
  }

  console.log(userData)

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleReact = async (contentType: 'post' | 'comment', contentId: number, reactionTypeId: number) => {
    try {
      const result = await reactToContent(contentType, contentId, reactionTypeId);
      setPosts(prevPosts => prevPosts.map(post =>
        post.id === contentId ? { ...post, reactions: result.reactions, user_reaction: result.user_reaction } : post
      ));
      return result;
    } catch (error) {
      console.error("Failed to react:", error);
      throw error;
    }
  };

  const handlePostUpdate = (updatedPost: any) => {
    setPosts(prevPosts => prevPosts.map(post => post.id === updatedPost.id ? updatedPost : post));
  };

  const handlePostDelete = (postId: number) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  return (
    <div className={`${styles.page} ${isModalOpen ? 'modalOpen' : ''}`}>
      <Nav />

      <div className={styles.profileSection}>
        <div className={styles.profileContainer}>
          <div className={styles.ImageContainer}>
            <img
              src={userData.avatarUrl ? `${basePath}${userData.avatarUrl}` : `${basePath}ProfileImage.png`}
              alt="Profile Picture"
              className={styles.profilePic}
            />
          </div>
          <StatsBtn
            userData={userData}
            followersCount={followersCount}
            setFollowersCount={setFollowersCount}
            postCount={userData.postCount}
          />
          <ProfileBtns userData={userData} setFollowersCount={setFollowersCount} isOwner={isOwner} onEditClick={handleEditClick} onProfileActionClick={handleProfileActionClick}/>
        </div>

        <div className={styles.profileInfo}>
          <div className={styles.profileDetails}>
            <h1 className={styles.profileName}> {userData.firstName} {userData.lastName} </h1>
            <p className={styles.profileBio}>{userData.aboutMe}</p>
          </div>
        </div>
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.navTabs}>
          <div className={`${styles.navTab} ${activeTab === 'About' ? styles.active : ''}`} id="About" onClick={() => handleTabClick('About')}>
            About
          </div>
          <div className={`${styles.navTab} ${activeTab === 'Posts' ? styles.active : ''}`} id="Posts" onClick={() => handleTabClick('Posts')}>
            Posts
          </div>
        </div>
        <div className={styles.content}>
          {(!userData.isPublic && !isOwner && followState !== "Following") ? (
            // If privacy is private, the viewer is not the owner, and not following, show the private logo
            <div className={styles.privateLogo}>
              <img src={PrivateImage.src} alt="Private" />
            </div>
          ) : (
            <>
              {activeTab === 'About' && <About userData={userData} />}
              {activeTab === 'Posts' && (
                <PostContainer
                  posts={posts}
                  isLoading={isLoading}
                  error={error}
                  isOwner={isOwner}
                  userPrivacy={userData.isPublic}
                  onPostUpdate={handlePostUpdate}
                  onPostDelete={handlePostDelete}
                />
              )}
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <EditProfileWindow
          userData={userData}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default Page;

interface PostContainerProps {
  posts: any[];
  isLoading: boolean;
  error: string | null;
  isOwner: boolean;
  userPrivacy: boolean;
  onPostUpdate: (updatedPost: any) => void;
  onPostDelete: (postId: number) => void;
}

const PostContainer: React.FC<PostContainerProps> = ({
  posts,
  isLoading,
  error,
  isOwner,
  userPrivacy,
  onPostUpdate,
  onPostDelete
}) => {
  if (isLoading) {
    return <div className={styles.loading}>Loading posts...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!posts || posts.length === 0) {
    return <div className={styles.noPost}>No posts to display</div>;
  }

  return (
    <div className={styles.postsWrapper}>
      {posts.map((post) => (
        <div key={post.id} className={styles.PostContainer}>
          {post.group ? (
            <GroupPost
              post={post}
              onPostUpdate={onPostUpdate}
              onPostDelete={onPostDelete}
            />
          ) : (
            <GeneralPost
              post={post}
              onPostUpdate={onPostUpdate}
              onPostDelete={onPostDelete}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const About = ({ userData }: { userData: User}) => {
    return (
      <div className={styles.about}>
        {userData.email && (
          <p>
            Email: <span className={styles.data}>{userData.email}</span>
          </p>
        )}
        {userData.username && (
          <p>
            Username: <span className={styles.data}>{userData.username}</span>
          </p>
        )}
        {userData.nickname && userData.nickname.trim() && (
          <p>
            Nickname: <span className={styles.data}>{userData.nickname}</span>
          </p>
        )}
        {userData.firstName && (
          <p>
            First Name: <span className={styles.data}>{userData.firstName}</span>
          </p>
        )}
        {userData.lastName && (
          <p>
            Last Name: <span className={styles.data}>{userData.lastName}</span>
          </p>
        )}
        {userData.dateOfBirth && (
          <p>
            Date of Birth: <span className={styles.data}>{userData.dateOfBirth.split("T")[0].split("-").reverse().join("-")}</span>
          </p>
        )}
        {userData.aboutMe && userData.aboutMe.trim() && (
          <p>
            About me: <span className={styles.data}>{userData.aboutMe}</span>
          </p>
        )}
      </div>
    );
};
