"use client";
import React, { useState, useEffect } from "react";
import GeneralPost from "../../../components/generalPost";
import styles from "../Styles/posts.module.css";
import CreatePost from "./createPostWindow";
import { useParams } from "next/navigation";
import { fetchGroupPosts } from "../../../api/posts";

const Posts = () => {
  const [isCreatePostVisible, setIsCreatePostVisible] = useState(false);
  const [posts, setPosts] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { groupname } = useParams();

  const showCreatePost = () => {
    setIsCreatePostVisible(true);
  };

  const hideCreatePost = () => {
    setIsCreatePostVisible(false);
  };

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const fetchedPosts = await fetchGroupPosts(groupname as string);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching group posts:", error);
      setPosts([]); // Set to empty array if there's an error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [groupname]);

  const handlePostUpdate = (updatedPost: any) => {
    setPosts(prevPosts => prevPosts?.map(post => post.id === updatedPost.id ? updatedPost : post) || null);
  };

  const handlePostDelete = (postId: number) => {
    setPosts(prevPosts => prevPosts?.filter(post => post.id !== postId) || null);
  };

  if (isLoading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div className={styles.contentContainer}>
      <div className={styles.content}>
        {posts && posts.length > 0 ? (
          posts.map((post: any) => (
            <div key={post.id} className={styles.postContainer}>
              <GeneralPost
                post={post}
                onPostUpdate={handlePostUpdate}
                onPostDelete={handlePostDelete}
              />
            </div>
          ))
        ) : (
          <div className={styles.noPosts}>No posts available.</div>
        )}
      </div>
      <div className={styles.CreateBtnContainer}>
        <button className={styles.CreateBtn} onClick={showCreatePost}>
          Create Post
        </button>
        {isCreatePostVisible && <CreatePost onClose={hideCreatePost} onPostCreated={loadPosts} groupname={groupname as string} />}
      </div>
    </div>
  );
};

export default Posts;
