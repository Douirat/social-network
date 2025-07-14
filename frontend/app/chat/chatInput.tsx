"use client"
import React, { useState, useEffect } from "react";
import styles from "./Style/chat.module.css";
import { Chat, ChatMessage } from "../home/DM/Chat/chatList";
import { sendMessageChat } from "../api/chat";
import EmojiPicker from 'emoji-picker-react';

const ChatInput: React.FC<{ chat: Chat }> = ({ chat }) => {
    const [message, setMessage] = useState<string>("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const onEmojiClick = (emojiObject: any) => {
        setMessage(prevMsg => prevMsg + emojiObject.emoji);
    };

    const validateAndSendChatMessage = () => {
        if (message.length > 0) {
            const chatMsg: ChatMessage = {
                senderId: chat.userA.id,
                receiverId: chat.userB.id,
                content: message,
                createdAt: new Date(Date.now()),
                id: 0,
                groupId: 0
            }
            if (chat.group && chat.group.id !== 0) {
                chatMsg.groupId = chat.group.id
            } 
            sendMessageChat(chatMsg)
            setMessage("")
        }
    }

    const enterCheck = (event: any) => {
        if (event.key === "Enter") {
            validateAndSendChatMessage()
        }
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showEmojiPicker && !(event.target as Element).closest(`.${styles.emojiContainer}`)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showEmojiPicker]);

    return (
        <div className={styles.chatInputContainer}>
            <div className={styles.chatInputDiv}>
                <input 
                    value={message} 
                    type="text" 
                    className={styles.chatInput} 
                    placeholder="Message..." 
                    onKeyDown={enterCheck}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                        setMessage(event.target.value)} 
                    maxLength={2000} 
                />
                <button className={styles.sendBtn} onClick={validateAndSendChatMessage}>
                    <svg viewBox="0 0 24 24" width="24" height="24" className={styles.sendIcon}>
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                    </svg>
                </button>
            </div>

            <div className={styles.emojiContainer}>
                <button className={styles.emojiButton} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <svg width="23" height="23" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="9" fill="var(--SVG-color)" stroke="var(--SVG-color)" strokeWidth="1"/>
                        <circle cx="7" cy="8" r="1.5" fill="var(--container-color)" />
                        <circle cx="13" cy="8" r="1.5" fill="var(--container-color)" />
                        <path d="M5.5 11.5C6.5 13.5 8.5 14.5 10 14.5C11.5 14.5 13.5 13.5 14.5 11.5" 
                            stroke="var(--container-color)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    </svg>
                </button>
                {showEmojiPicker && (
                    <div className={styles.emojiPickerContainer} onClick={e => e.stopPropagation()}>
                        <EmojiPicker 
                            onEmojiClick={onEmojiClick}
                            width={320}
                            height={450}
                            theme="dark"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatInput;
