/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { FaRegComment, FaEdit, FaTrash } from 'react-icons/fa';
import { API_BASE_URL } from '../config';
import styles from './Style/post.module.css';
import { reactToContent, fetchAvailableReactions } from '../api/reactions';
import { deletePost } from '../api/posts';
import EditPostModal from './EditPostModal';
import { AuthContext } from '../auth/AuthProvider';

interface GeneralPostProps {
  post: any;
  onPostUpdate: (updatedPost: any) => void;
  onPostDelete: (postId: number) => void;
}

// Static cache for reactions
let cachedReactions: any[] | null = null;
let isFetchingReactions = false;
const reactionListeners: (() => void)[] = [];

const GeneralPost: React.FC<GeneralPostProps> = ({ post, onPostUpdate, onPostDelete }) => {
  const [reactions, setReactions] = useState<any[]>([]);
  const [isLoadingReactions, setIsLoadingReactions] = useState(true);
  const [postReactions, setPostReactions] = useState<{ [key: string]: number }>({});
  const [userReaction, setUserReaction] = useState<any>(null);
  const [showReactionsPicker, setShowReactionsPicker] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user } = useContext(AuthContext);
  const router = useRouter();


  useEffect(() => {
    const loadReactions = async () => {
      if (cachedReactions) {
        setReactions(cachedReactions);
        setIsLoadingReactions(false);
        return;
      }

      if (isFetchingReactions) {
        // If already fetching, wait for it to complete
        const listener = () => {
          setReactions(cachedReactions!);
          setIsLoadingReactions(false);
        };
        reactionListeners.push(listener);
        return () => {
          const index = reactionListeners.indexOf(listener);
          if (index > -1) reactionListeners.splice(index, 1);
        };
      }

      isFetchingReactions = true;
      try {
        const fetchedReactions = await fetchAvailableReactions();
        cachedReactions = fetchedReactions;
        setReactions(fetchedReactions);
        reactionListeners.forEach(listener => listener());
      } catch (error) {
        console.error("Failed to load reactions:", error);
      } finally {
        setIsLoadingReactions(false);
        isFetchingReactions = false;
      }
    };

    loadReactions();
  }, []);

  useEffect(() => {
    if (post && user) {
      setPostReactions(post.reactions || {});
      setUserReaction(post.user_reaction || null);
    }
  }, [post, user]);

  const handleReact = async (reactionTypeId: number) => {
    try {
      const result = await reactToContent('post', post.id, reactionTypeId);
      setPostReactions(result.reactions);
      setUserReaction(result.user_reaction);
      setShowReactionsPicker(false);
      onPostUpdate({ ...post, reactions: result.reactions, user_reaction: result.user_reaction });
    } catch (error) {
      console.error("Failed to react to post:", error);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(post.id);
        onPostDelete(post.id);
        
        // Check if we're on a single post page by checking the URL
        const isPostPage = window.location.pathname.startsWith('/posts/');
        if (isPostPage) {
          router.push('/home');
        }
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleUpdatePost = (updatedPost: any) => {
    onPostUpdate(updatedPost);
    setShowEditModal(false);
  };

  const profilePicture = post?.user?.avatarUrl
    ? `${API_BASE_URL}/images?imageName=${post.user.avatarUrl}`
    : `${API_BASE_URL}/images?imageName=ProfileImage.png`;


  const getReactionIcon = (reactionName: string): string => {
    const reaction = reactions.find(r => r.name.toLowerCase() === reactionName.toLowerCase());
    return reaction ? reaction.icon_url : '👍';
  };

  const isPostOwner = user?.id === post.user.id;

  if (!post) {
    return null;
  }

  if (isLoadingReactions) {
    return <div>Loading reactions...</div>;
  }

  return (
    <div className={styles.postCard}>
      <div className={styles.postHeader}>
        <img
          src={profilePicture}
          alt="Profile"
          className={styles.profilePicture}
        />
        <div className={styles.postInfo}>
          <Link href={`/u/${encodeURIComponent(post?.user?.username || '')}`}>
            <p className={styles.postAuthor}>{post?.user?.username || "Unknown User"}</p>
          </Link>
          <p className={styles.postTime}>
            {post?.created_at ? new Date(post.created_at).toLocaleString() : "Unknown Date"} •
            {post?.privacy || "Unknown Privacy"}
            {post?.group && (
              <>
                {" • "}
                <Link href={`/groups/${encodeURIComponent(post.group.title)}`}>
                  Group: {post.group.title}
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      <div className={styles.postContent}>
        <h2 className={styles.postTitle}>{post?.title || "Untitled"}</h2>
        <p>{post?.content || "No content"}</p>
        {post?.file && (
          <div className={styles.postImageContainer}>
            <img src={`${API_BASE_URL}/images?imageName=${post.file}`} alt="Post content" className={styles.postImage} />
          </div>
        )}
      </div>

      <div className={styles.postActions}>
        <div className={styles.reactionsContainer}>
          {Object.entries(postReactions || {}).map(([reactionName, count]) => (
            <button key={reactionName} className={styles.reactionButton}>
              <span dangerouslySetInnerHTML={{ __html: getReactionIcon(reactionName) }} />
              {count}
            </button>
          ))}
        </div>
        <button
          className={styles.actionButton}
          onClick={() => setShowReactionsPicker(!showReactionsPicker)}
        >
          {userReaction ? (
            <span dangerouslySetInnerHTML={{
              __html: getReactionIcon(reactions.find(r => r.id === userReaction.reaction_type_id)?.name || '')
            }} />
          ) : (
            'React'
          )}
        </button>
        <Link href={`/posts/${post.id}`} className={styles.actionButton}>
          <FaRegComment className={styles.actionIcon} />
          Comment
        </Link>
        {isPostOwner && (
          <>
            <button onClick={handleEdit} className={styles.actionButton}>
              <FaEdit className={styles.actionIcon} />
              Edit
            </button>
            <button onClick={handleDelete} className={styles.actionButton}>
              <FaTrash className={styles.actionIcon} />
              Delete
            </button>
          </>
        )}
      </div>

      {showReactionsPicker && (
        <div className={styles.reactionsPicker}>
          {reactions.map((reaction) => (
            <button
              key={reaction.id}
              onClick={() => handleReact(reaction.id)}
              className={userReaction?.reaction_type_id === reaction.id ? styles.userReaction : ''}
            >
              <span dangerouslySetInnerHTML={{ __html: reaction.icon_url }} />
            </button>
          ))}
        </div>
      )}

      {showEditModal && (
        <EditPostModal
          post={post}
          onClose={handleCloseEditModal}
          onUpdate={handleUpdatePost}
        />
      )}
    </div>
  );
};

export default GeneralPost;
