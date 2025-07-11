"use client";
import React, { useState } from "react";
import styles from './Style/search.module.css';

interface SearchProps {
  users: { id: number; username: string; profileImg: string }[]; // Define the user type
  setFilteredUsers: React.Dispatch<React.SetStateAction<{ id: number; username: string; profileImg: string }[]>>; // Define the setter type
  onFocus?: () => void;
}

const Search: React.FC<SearchProps> = ({ users, setFilteredUsers, onFocus }) => {
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query); // Update search query state
    if (onFocus) {
      onFocus(); // Call the onFocus function if it exists
  }
    const filteredUsers = users?.filter(user =>
      user.username.toLowerCase().includes(query.toLowerCase()) // Filter users based on the search query
    );
    setFilteredUsers(filteredUsers); // Update the filtered users in the parent component
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search by username"
        value={searchQuery}
        onChange={handleSearchChange} // Handle input change
        onFocus={onFocus}
      />
       <button className={styles.searchButton} aria-label="Search">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            fill="white"
          />
        </svg>
      </button>
    </div>
  );
};

export default Search;