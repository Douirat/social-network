import { API_BASE_URL } from "@/app/config";
import styles from "../../../home/Style/createGroup.module.css"

const Member: React.FC<{ username: string; profileImage: string }> = ({ username, profileImage }) => {
    const profilePicture = profileImage
        ? `${API_BASE_URL}/images?imageName=${profileImage}`
        : `${API_BASE_URL}/images?imageName=ProfileImage.png`;

    return (
        <div className={styles.invitee}>
            <img
                src={profilePicture}
                alt="User profile"
                className={styles.inviteeProfileImg}
            />
            <p className={styles.inviteeUserName}>{username}</p>
        </div>
    );
}

export default Member
