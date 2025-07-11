import React from "react";
import GeneralPost from "@/app/components/generalPost";
import styles from "../Style/groupPost.module.css";
import Link from "next/link";

interface GroupPostProps {
  post: any; // Replace 'any' with your actual Post type
  onPostUpdate: (updatedPost: any) => void;
  onPostDelete: (postId: number) => void;
}

const GroupPost: React.FC<GroupPostProps> = ({ post, onPostUpdate, onPostDelete }) => {
  return (
    <div className={styles.groupPostContainer}>
      {post.group && (
        <p className={styles.groupName}>
          Posted by  {" "}
          <Link href={`/groups/${encodeURIComponent(post.group.title)}`}>
            {post.group.title}
          </Link>
          {" "} group
        </p>
      )}
      <div className={styles.post}>
        <GeneralPost 
          post={post} 
          onPostUpdate={onPostUpdate}
          onPostDelete={onPostDelete}
        />
      </div>
    </div>
  );
};

export default GroupPost;
