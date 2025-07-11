import React, { useState } from "react";
import styles from "../../Style/directMessages.module.css";


interface ChatBtnProps {
  onClick?: () => void; // Optional onClick prop
}

const addChatBtn: React.FC<ChatBtnProps> = ({ onClick }) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  return (
    <button
      className={styles.addChatBtn}
      onMouseEnter={() => setHoveredButton("Add Chat")}
      onMouseLeave={() => setHoveredButton(null)}
      onClick={onClick}
    >
      <svg
        width="25"
        height="25"
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
      {hoveredButton && <div className={styles.tooltip}>{hoveredButton}</div>}
    </button>
  );
};

export default addChatBtn;
