import React, { useState } from "react";
import styles from "../../Style/directMessages.module.css";

interface AddChatBtnProps {
  onClick?: () => void; // Optional onClick prop
}

const chatBtn: React.FC<AddChatBtnProps> = ({ onClick }) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  return (
    <button
      className={styles.chatBtn}
      onClick={onClick}
      onMouseEnter={() => setHoveredButton("Chat")}
      onMouseLeave={() => setHoveredButton(null)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="25"
        height="25"
      >
        <circle cx="12" cy="12" r="10" fill="var(--primary-color)" />
        <g transform="scale(0.6) translate(8, 8)">
          <path
            d="M3 3h18a2 2 0 012 2v12a2 2 0 01-2 2H5l-2 2v-2H3a2 2 0 01-2-2V5a2 2 0 012-2zm0 2v12h18V5H3zm3 3h12v2H6V8zm0 4h12v2H6v-2z"
            fill="white"
          />
        </g>
      </svg>
      {hoveredButton && <div className={styles.tooltip}>{hoveredButton}</div>}
    </button>
  );
};

export default chatBtn;
