package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"

	"social_network/internal/handlers/utils"
	"social_network/internal/models"
	"social_network/internal/services"

	"golang.org/x/crypto/bcrypt"
)

// UsersHandlersLayer defines the contract for user handlers
type UsersHandlersLayer interface {
	UsersRegistrationHandler(w http.ResponseWriter, r *http.Request)
	Login(w http.ResponseWriter, r *http.Request)
}

// UsersHandlers implements the user handlers contract
type UsersHandlers struct {
	chatBroker  *services.ChatBroker
	userServ    services.UsersServicesLayer
	sessionServ services.SessionsServicesLayer
}

// Credentials represents login credentials
type Credentials struct {
	Email    string `json:"emailOrUsername"`
	Password string `json:"password"`
}

// Edge struct for pagination
type Edge struct {
	Offset int `json:"offset"`
	Limit  int `json:"limit"`
}

// NewUsersHandlers creates a new user handler
func NewUsersHandlers(chatBro *services.ChatBroker, userServ services.UsersServicesLayer, sessionServ services.SessionsServicesLayer) *UsersHandlers {
	return &UsersHandlers{
		chatBroker:  chatBro,
		userServ:    userServ,
		sessionServ: sessionServ,
	}
}

const maxUploadSize = 10 * 1024 * 1024

// UsersRegistrationHandler handles user registration
func (userHandler *UsersHandlers) UsersRegistrationHandler(w http.ResponseWriter, r *http.Request) {

	err := r.ParseMultipartForm(maxUploadSize)
	if err != nil {
		http.Error(w, "Error parsing form", http.StatusBadRequest)
		return
	}

	nickname := r.FormValue("nickname")
	username := r.FormValue("username")
	email := r.FormValue("email")
	password := r.FormValue("password")
	firstName := r.FormValue("firstName")
	lastName := r.FormValue("lastName")
	gender := r.FormValue("gender")
	dateOfBirth := r.FormValue("dateOfBirth")
	about := r.FormValue("aboutMe")

	_, _, err = r.FormFile("profilepicture")
	if err != nil {
		fmt.Println("Error reading profile picture:", err)
		// Optional: You can decide whether to return or continue if profile pic is optional
	}

	passwordBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}
	passwordHash := string(passwordBytes)

	user := &models.User{
		NickName:    nickname,
		Username:    username,
		DateOfBirth: dateOfBirth,
		FirstName:   firstName,
		LastName:    lastName,
		Email:       email,
		Gender:      gender,
		Password:    passwordHash,
		About:       about,
	}

	err = userHandler.userServ.UserRegestration(user)
	if err != nil {
		fmt.Println("Error registering user:", err)
		utils.ResponseJSON(w, http.StatusInternalServerError, map[string]any{"error": "Error registering user"})
		return
	}

	usr, err := userHandler.userServ.GetUseruser(user.Username)
	if err != nil {
		fmt.Println("Error getting user by username:", err)
		utils.ResponseJSON(w, http.StatusInternalServerError, map[string]any{"error": "Error retrieving user after registration"})
		return
	}

	token, expiresAt, err := userHandler.sessionServ.CreateSession(usr.Id)
	if err != nil {
		fmt.Println("Error creating session:", err)
		utils.ResponseJSON(w, http.StatusInternalServerError, map[string]any{"error": "Failed to create session"})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    token,
		Expires:  expiresAt,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	// ✅ Send proper structure expected by frontend
	utils.ResponseJSON(w, http.StatusCreated, map[string]any{
		"success": true,
		"user": map[string]any{
			"id":          usr.Id,
			"username":    usr.Username,
			"nickname":    usr.NickName,
			"email":       usr.Email,
			"first_name":  usr.FirstName,
			"last_name":   usr.LastName,
			"gender":      usr.Gender,
			"dateOfBirth": usr.DateOfBirth,
			"about":       usr.About,
			"token":       token,
			"expires_at":  expiresAt.Format(http.TimeFormat),
		},
	})
}


// UsersLoginHandler handles user authentication
func (userHandler *UsersHandlers) UsersLoginHandler(w http.ResponseWriter, r *http.Request) {


	err := r.ParseForm()
	if err != nil {
		utils.ResponseJSON(w, http.StatusBadRequest, map[string]any{"message": "Error parsing form"})
		return
	}

	type Credentials struct {
		Email    string `json:"emailOrUsername"`
		Password string `json:"password"`
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		utils.ResponseJSON(w, http.StatusBadRequest, map[string]any{"message": "Error reading request body"})
		return
	}
	defer r.Body.Close()



	var credentials Credentials
	err = json.Unmarshal(body, &credentials)
	if err != nil {
		utils.ResponseJSON(w, http.StatusBadRequest, map[string]any{"message": "Invalid JSON format"})
		return
	}


	user, err := userHandler.userServ.AuthenticateUser(credentials.Email, credentials.Password)
	if err != nil {
		utils.ResponseJSON(w, http.StatusUnauthorized, map[string]any{"message": "Authentication failed"})
		return
	}

	token, expiresAt, err := userHandler.sessionServ.CreateSession(user.Id)
	if err != nil {
		utils.ResponseJSON(w, http.StatusInternalServerError, map[string]any{"message": "Failed to create session"})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    token,
		Expires:  expiresAt,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	userHandler.chatBroker.DeleteIfClientExist(user.Id)
	

	// ✅ FIXED RESPONSE STRUCTURE
	utils.ResponseJSON(w, http.StatusCreated, map[string]any{
		"success": true,
		"user": map[string]any{
			"id":         user.Id,
			"token":      token,
			"expires_at": expiresAt.Format(http.TimeFormat),
		},
	})
}

// UsersLogoutHandler logs out the user
func (userHandler *UsersHandlers) UsersLogoutHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_token")
	if err != nil {
		utils.ResponseJSON(w, http.StatusUnauthorized, map[string]any{"message": "invalid token"})
		return
	}
	token := cookie.Value

	userId, err := userHandler.sessionServ.GetUserIdFromSession(token)
	if err != nil {
		utils.ResponseJSON(w, http.StatusUnauthorized, map[string]any{"message": "invalid session"})
		return
	}

	err = userHandler.sessionServ.DestroySession(token)
	if err != nil {
		utils.ResponseJSON(w, http.StatusInternalServerError, map[string]any{"message": "failed to logout"})
		return
	}

	client := &services.Client{UserId: userId}
	userHandler.chatBroker.Unregister <- client

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
	})

	utils.ResponseJSON(w, http.StatusCreated, map[string]string{"message": "User logged out successfully"})
}

// UsersCheckSessionHandler checks if user is logged in
func (userHandler *UsersHandlers) UsersCheckSessionHandler(w http.ResponseWriter, r *http.Request) {

	cookie, err := r.Cookie("session_token")
	if err != nil {
		utils.ResponseJSON(w, http.StatusUnauthorized, map[string]any{"message": "invalid token"})
		return
	}

	token := cookie.Value
	logged := userHandler.sessionServ.IsValidSession(token)
	if !logged {
		utils.ResponseJSON(w, http.StatusUnauthorized, map[string]any{"message": "invalid token"})
		return
	}

	utils.ResponseJSON(w, http.StatusOK, map[string]string{"message": "User logged out successfully"})
}

// GetProfileHandler returns the user profile
func (userHandler *UsersHandlers) GetProfileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		utils.ResponseJSON(w, http.StatusMethodNotAllowed, map[string]any{"message": "invalid method"})
		return
	}

	cookie, err := r.Cookie("session_token")
	if err != nil {
		utils.ResponseJSON(w, http.StatusUnauthorized, map[string]any{"message": "invalid token"})
		return
	}

	token := cookie.Value
	userId, err := userHandler.sessionServ.GetUserIdFromSession(token)
	if err != nil {
		utils.ResponseJSON(w, http.StatusInternalServerError, map[string]any{"message": "invalid user id"})
		return
	}

	user, err := userHandler.userServ.GetUserProfile(userId)
	if err != nil {
		utils.ResponseJSON(w, http.StatusInternalServerError, map[string]any{"message": "user does't exist"})
		return
	}
	user.Password = "********"

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// GetLastUser returns the last user by id
func (userHandler *UsersHandlers) GetLastUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.ResponseJSON(w, http.StatusMethodNotAllowed, map[string]any{"message": "invalid method"})
		return
	}

	query := r.URL.Query()
	userId := query.Get("user_id")
	if userId == "" {
		utils.ResponseJSON(w, http.StatusBadRequest, map[string]any{"message": "missing user id"})
		return
	}

	userID, err := strconv.Atoi(userId)
	if err != nil || userID <= 0 {
		utils.ResponseJSON(w, http.StatusBadRequest, map[string]any{"message": "invalid user id"})
		return
	}

	user, err := userHandler.userServ.GetUserProfile(userID)
	if err != nil {
		log.Printf("error fetching user %d: %v", userID, err)
		utils.ResponseJSON(w, http.StatusInternalServerError, map[string]any{"message": "error fetching the user"})
		return
	}

	user.Age = 0
	user.Email = ""
	user.Gender = ""
	user.FirstName = ""
	user.LastName = ""

	utils.ResponseJSON(w, http.StatusOK, user)
}

/*
In this file, a session is created during user login in the UsersLoginHandler method.
Specifically, after successful authentication, the following code creates a session:

token, expiresAt, err := userHandler.sessionServ.CreateSession(user.Id)

This creates a new session for the user and returns a session token and its expiration time.
The session token is then set as an HTTP cookie in the response.
*/
