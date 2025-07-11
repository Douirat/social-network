import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../Style/activeUsers.module.css";
import { API_BASE_URL } from "../../config";

interface UserItem {
  id: number;
  username: string;
  profileImg: string;
  postCount: number;
}

const ActiveUsers = () => {
  const [users, setUsers] = useState<UserItem[]>([]);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/top-engaged-users`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch top engaged users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching top engaged users:', error);
      }
    };

    fetchTopUsers();
  }, []);

  return (
    <div className={styles.usersContainer}>
      <div className={styles.Header}>
        <h2>Top 3 Engaged Members</h2>
      </div>
      <div className={styles.usersList}>
        {users.map((user) => (
          <Link href={`/u/${encodeURIComponent(user.username)}`} key={user.id} className={styles.userLink}>
            <div className={styles.userItem}>
              <img
                src={`${API_BASE_URL}/images?imageName=${user.profileImg || 'ProfileImage.png'}`}
                alt={`${user.username}'s profile`}
                className={styles.profileImg}
              />
              <div className={styles.userInfo}>
                <h3>{user.username}</h3>
                <p>{user.postCount} posts</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ActiveUsers;
