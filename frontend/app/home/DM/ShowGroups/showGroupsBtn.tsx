import React, { useState } from "react";
import styles from "../../Style/directMessages.module.css";

interface AddChatBtnProps {
  onClick?: () => void; // Optional onClick prop
}

const showGroupsBtn: React.FC<AddChatBtnProps> = ({ onClick }) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  return (
    <button
      className={styles.showGroupsBtn}
      onClick={onClick}
      onMouseEnter={() => setHoveredButton("Show Groups")}
      onMouseLeave={() => setHoveredButton(null)}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="11" fill="var(--primary-color)" />
        <g transform="scale(0.7) translate(8, 8)">
          <path
            fill="white"
            d="M9.1 0h-.2C7.3.004 6.003 1.3 6 2.9v1.2C6.004 5.7 7.3 6.996 8.9 7h.2c1.6-.004 2.896-1.3 2.9-2.9V2.9C11.996 1.3 10.7.003 9.1 0zm8.808 7.09c.15-.15.316-.28.488-.39-.172.116-.337.247-.488.398V7.09zm.488-.39c.172-.118.35-.207.536-.283-.185.076-.364.172-.536.282zM15 9c-.26 0-.507.044-.747.106.475.86.747 1.845.747 2.894v4h2c.55 0 1-.445 1-.995V12c0-1.65-1.35-3-3-3zm-11.253.106C3.507 9.044 3.26 9 3 9c-1.65 0-3 1.35-3 3v3.005c0 .55.45.995 1 .995h2v-4c0-1.05.272-2.035.747-2.894zM15.067 3h-.134c-1.067.003-1.93.928-1.933 2.07v.86c.003 1.142.866 2.067 1.932 2.07h.135c1.066-.003 1.93-.928 1.932-2.07v-.86c-.005-1.142-.868-2.067-1.934-2.07zm-12 0h-.135c-1.066.003-1.93.928-1.932 2.07v.86c.003 1.142.866 2.067 1.932 2.07h.135C4.134 7.997 4.997 7.072 5 5.93v-.86C4.997 3.928 4.134 3.003 3.068 3zM11 18H7c-1.1 0-2-.9-2-2v-4c0-2.2 1.8-4 4-4s4 1.8 4 4v4c0 1.1-.9 2-2 2z"
          />
        </g>
      </svg>
      {hoveredButton && <div className={styles.tooltip}>{hoveredButton}</div>}
    </button>
  );
};

export default showGroupsBtn;
