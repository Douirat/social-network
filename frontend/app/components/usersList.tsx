import React, { useState, useEffect } from "react";
import Link from 'next/link';
import User from "./userItem";
import styles from "./Style/userList.module.css";
import Search from "./search";

export interface UserType {
  id: number;
  username: string;
  profileImg: string;
}

interface UsersListProps {
  users: UserType[];
  setCheckedUserIds?: (ids: number[]) => void;
  initialCheckedIds?: number[];
  selectable?: boolean;
}

const UsersList: React.FC<UsersListProps> = ({ 
  users, 
  setCheckedUserIds, 
  initialCheckedIds = [],
  selectable = false
}) => {
  const [checkedUsers, setCheckedUsers] = useState<number[]>(initialCheckedIds);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>(users);

  const toggleUserCheck = (userId: number) => {
    setCheckedUsers((prev) => {
      const newCheckedUsers = prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];
      return newCheckedUsers;
    });
  };

  useEffect(() => {
    if (setCheckedUserIds) {
      setCheckedUserIds(checkedUsers);
    }
  }, [checkedUsers, setCheckedUserIds]);

  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  return (
    <div className={styles.ListContainer}>
      <Search users={users} setFilteredUsers={setFilteredUsers} />
      <div className={styles.usersList}>
        {filteredUsers && filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            selectable ? (
              <div key={user.id} style={{ width: '100%' }}>
                <User
                  username={user.username}
                  profileImg={user.profileImg || "profileImage.png"}
                  isChecked={checkedUsers.includes(user.id)}
                  toggleCheck={() => toggleUserCheck(user.id)}
                />
              </div>
            ) : (
              <Link 
                href={`/u/${encodeURIComponent(user.username)}`} 
                key={user.id} 
                style={{ display: 'block', width: '100%' }}
              >
                <User
                  username={user.username}
                  profileImg={user.profileImg || "profileImage.png"}
                  isChecked={false}
                  toggleCheck={() => {}}
                />
              </Link>
            )
          ))
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  );
};

export default UsersList;
