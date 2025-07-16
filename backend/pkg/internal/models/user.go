package models

// Create a structure to represent the user:
type User struct {
	Id          int   `json:"id"`
	NickName    string `json:"nickname"`
	Username    string `json:"username"`
	Age         int    `json:"age"`
	DateOfBirth string `json:"dateOfBirth"`
	Gender      string `json:"gender"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	About       string `json:"aboutMe"`
}

// Create a model to ease working on chat
type ChatUser struct {
	Id          int    `json:"id"`
	NickName    string `json:"nick_name"`
	IsOnline    bool   `json:"is_online"`
	UnreadCount int    `json:"unread_count"`
}
