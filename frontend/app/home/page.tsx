"use client";

import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../auth/AuthProvider";
import Nav from "../components/nav";
import MiniProfile from "./Components/miniProfile";
import GeneralPost from "../components/generalPost";
import GroupPost from "./Components/groupPost";
import styles from "./Style/homePage.module.css";
import DirectMessages from "./DM/directMessages";
import ActiveUsers from "./Components/activeUsers";
import { fetchPosts } from "../api/posts";

interface Post {
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
  likes_count: number;
  is_liked: boolean;
  group?: {
    id: number;
    name: string;
  };
}

const Home = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    } else {
      fetchPosts()
        .then(setPosts)
        .catch((error) => console.error("Failed to fetch posts:", error));
    }
  }, [isLoggedIn, router]);

  const handlePostUpdate = (updatedPost: any) => {
    setPosts(prevPosts => prevPosts.map(post => post.id === updatedPost.id ? updatedPost : post));
  };

  const handlePostDelete = (postId: number) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  if (!isLoggedIn) return null;

  return (
    <>
      <Nav />
      <div className={styles.HomeContent}>
        <div className={styles.LeftSection}>
          <MiniProfile />
        </div>
        <div className={styles.Posts}>
          {posts.map((post) => (
            post.group ? (
              <GroupPost 
                key={post.id} 
                post={post} 
                onPostUpdate={handlePostUpdate}
                onPostDelete={handlePostDelete}
              />
            ) : (
              <GeneralPost 
                key={post.id} 
                post={post} 
                onPostUpdate={handlePostUpdate}
                onPostDelete={handlePostDelete}
              />
            )
          ))}
        </div>
        <div className={styles.RightSection}>
          <DirectMessages />
        </div>
      </div>
    </>
  );
};

export default Home;
