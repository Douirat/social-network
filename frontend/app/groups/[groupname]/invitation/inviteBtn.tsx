import React, {useState} from "react";
import styles from "../Styles/groupPage.module.css";
import InvitationList from './invitationList'

const inviteBtn = () => {
  const [isInvitationListVisible, setIsInvitationListVisible] = useState(false);

  const showInvitationList = () => {
    setIsInvitationListVisible(true);
  };

  const hideInvitationList = () => {
    setIsInvitationListVisible(false);
  };
  return (
    <div>
        {isInvitationListVisible && <InvitationList onClose={hideInvitationList} />}
        <button className={` ${styles.btn} ${styles.inviteBtn}`} onClick={showInvitationList}>Invite</button>
    </div>
  );
};

export default inviteBtn;
