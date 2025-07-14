"use client";

import React from 'react';
import Nav from '../../components/nav';
import Post from '../../components/post';
import styles from './postPage.module.css';

interface PostPageProps {
  params: {
    postId: string;
  };
}

const PostPage: React.FC<PostPageProps> = ({ params }) => {
  const resolvedParams = React.use(params);

  return (
    <>
      <Nav />
      <div className={styles.Page}>
        <div className={styles.PostContainer}>
          <Post id={resolvedParams.postId} />
        </div>
      </div>
    </>
  );
};

export default PostPage;
