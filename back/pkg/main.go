package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"social_network/db/sqlite"
	"social_network/internal/handlers"
	"social_network/internal/repositories"
	"social_network/internal/router"
	"social_network/internal/services"
)

var (
	databaseConnection *sql.DB
	mainError          error
)

func init() {
	dbPath := "./data/social_network.db"
	migrationsPath := "./db/migrations/sqlite"

	databaseConnection, err := sqlite.ConnectAndMigrate(dbPath, migrationsPath)
	if err != nil {
		log.Fatalf("Failed to connect and migrate DB: %v", err)
	}
	defer databaseConnection.Close()

	// Now you can use `db` to query your SQLite database.

	log.Println("Backend app started")
}

func main() {
	if mainError != nil {
		return
	}
	defer databaseConnection.Close()
	fmt.Println("Connected successfully to database")

	// craete Chat Broker :
	chatBroker := services.NewChatBroker()
	go chatBroker.RunChatBroker()

	// Initialize repositories:
	usersRepository := repositories.NewUsersRepository(databaseConnection)
	sessionRepository := repositories.NewSessionsRepository(databaseConnection)
	postsRepository := repositories.NewPostsRepository(databaseConnection)
	commentsRepository := repositories.NewCommentsRepository(databaseConnection)
	messageRepository := repositories.NewMessageRepository(databaseConnection)

	// Initialize services:
	usersServices := services.NewUsersServices(usersRepository)
	sessionService := services.NewSessionsServices(usersRepository, sessionRepository)
	postsServices := services.NewPostService(postsRepository, sessionRepository)
	commentsService := services.NewCommentsServices(commentsRepository, sessionRepository)
	webSocketService := services.NewWebSocketService(chatBroker, messageRepository, sessionRepository, usersRepository)
	messagesService := services.NewMessageService(messageRepository, sessionRepository)

	// Initialize handlers:
	usersHandlers := handlers.NewUsersHandlers(chatBroker, usersServices, sessionService)
	postsHandlers := handlers.NewPostsHandles(postsServices)
	commentsHandlers := handlers.NewCommentsHandler(commentsService)
	webSocketHandler := handlers.NewWebSocketHandler(webSocketService, sessionService)
	messagesHandler := handlers.NewMessagesHandler(messagesService, sessionService)
	// Setup router and routes:
	mainRouter := router.NewRouter(sessionService)

	// mainRouter.AddRoute("GET", "/get_chat", messagesHandler.GetChatHistoryHandler)
	// mainRouter.AddRoute("POST", "/register", usersHandlers.UsersRegistrationHandler)
	// mainRouter.AddRoute("POST", "/login", usersHandlers.UsersLoginHandler)
	// mainRouter.AddRoute("POST", "/logout", usersHandlers.Logout)
	// mainRouter.AddRoute("GET", "/get_profile", usersHandlers.GetProfileHandler)
	// mainRouter.AddRoute("GET", "/get_last_user", usersHandlers.GetLastUser)
	// mainRouter.AddRoute("GET", "/logged_user", usersHandlers.IsLogged)
	// mainRouter.AddRoute("POST", "/add_post", postsHandlers.CreatePostsHandler)
	// mainRouter.AddRoute("GET", "/get_posts", postsHandlers.GetAllPostsHandler)
	// mainRouter.AddRoute("GET", "/get_categories", postsHandlers.GetAllCategoriesHandler)
	// mainRouter.AddRoute("POST", "/commenting", commentsHandlers.MakeCommentsHandler)
	// mainRouter.AddRoute("GET", "/get_comments", commentsHandlers.ShowCommentsHandler)
	// mainRouter.AddRoute("GET", "/ws", webSocketHandler.SocketHandler)
	// mainRouter.AddRoute("GET", "/get_users", webSocketHandler.GetUsers)
	// mainRouter.AddRoute("GET", "/get_chat", messagesHandler.GetChatHistoryHandler)
	// mainRouter.AddRoute("POST", "/mark_read", messagesHandler.MarkMessageAsRead)
	// Authentication routes
mainRouter.AddRoute("POST", "/login", usersHandlers.UsersLoginHandler)                 // you already have
mainRouter.AddRoute("POST", "/signup", usersHandlers.UsersRegistrationHandler)          // /register renamed signup?
mainRouter.AddRoute("POST", "/logout", usersHandlers.UsersLogoutHandler)                // inventing
mainRouter.AddRoute("GET", "/check-session", usersHandlers.UsersCheckSessionHandler)    // inventing

// User routes
mainRouter.AddRoute("GET", "/user/", usersHandlers.GetUserHandler)                      // keep /user/ (with param maybe)
mainRouter.AddRoute("GET", "/users", usersHandlers.GetUsersHandler)
mainRouter.AddRoute("GET", "/images", usersHandlers.GetImageHandler)                    // guessing under usersHandlers
mainRouter.AddRoute("POST", "/user/update", usersHandlers.UpdateUserHandler)
mainRouter.AddRoute("GET", "/top-engaged-users", usersHandlers.GetTopEngagedUsersHandler)
mainRouter.AddRoute("GET", "/user/posts", postsHandlers.GetUserPostsHandler)

// Post routes
mainRouter.AddRoute("GET", "/posts", postsHandlers.GetAllPostsHandler)
mainRouter.AddRoute("POST", "/post", postsHandlers.CreatePostHandler)
mainRouter.AddRoute("POST", "/post/update", postsHandlers.UpdatePostHandler)
mainRouter.AddRoute("POST", "/post/delete", postsHandlers.DeletePostHandler)
mainRouter.AddRoute("GET", "/post/single", postsHandlers.GetSinglePostHandler)

// Group posts
mainRouter.AddRoute("POST", "/group/post", postsHandlers.CreateGroupPostHandler)
mainRouter.AddRoute("GET", "/group/posts", postsHandlers.GetGroupPostsHandler)

// Comment routes
mainRouter.AddRoute("GET", "/comments", commentsHandlers.GetCommentsHandler)
mainRouter.AddRoute("POST", "/comment", commentsHandlers.AddCommentHandler)
mainRouter.AddRoute("POST", "/comment/update", commentsHandlers.UpdateCommentHandler)
// mainRouter.AddRoute("POST", "/comment/delete", commentsHandlers.DeleteCommentHandler) // commented out

// Reaction routes
mainRouter.AddRoute("POST", "/react", middleware.AuthMiddleware(reactionsHandlers.ReactHandler)) // invented reactionsHandlers
mainRouter.AddRoute("GET", "/reactions", middleware.AuthMiddleware(reactionsHandlers.GetAvailableReactionsHandler))

// Group routes
mainRouter.AddRoute("GET", "/groups", middleware.AuthMiddleware(groupsHandlers.GetGroupsHandler))
mainRouter.AddRoute("GET", "/group", middleware.AuthMiddleware(groupsHandlers.GetGroupHandler))
mainRouter.AddRoute("GET", "/group/details", middleware.AuthMiddleware(groupsHandlers.GetGroupDetailsHandler))
mainRouter.AddRoute("POST", "/group-requests", groupsHandlers.GroupRequestHandler)
mainRouter.AddRoute("POST", "/group-joinRequests", groupsHandlers.GroupJoinRequestHandler)
mainRouter.AddRoute("POST", "/group/create", groupsHandlers.CreateGroupHandler)
mainRouter.AddRoute("POST", "/group/update", middleware.AuthMiddleware(groupsHandlers.UpdateGroupHandler))
mainRouter.AddRoute("POST", "/group/delete", middleware.AuthMiddleware(groupsHandlers.DeleteGroupHandler))

// Follow routes
mainRouter.AddRoute("POST", "/Follow", followHandlers.InitFollowHandler)
mainRouter.AddRoute("GET", "/Following/", followHandlers.FollowingHandler)
mainRouter.AddRoute("GET", "/Followers/", followHandlers.FollowersHandler)
mainRouter.AddRoute("POST", "/Follow-requests", followHandlers.FollowRequestHandler)
mainRouter.AddRoute("GET", "/followers", followHandlers.GetFollowersHandler)

// Event routes
mainRouter.AddRoute("GET", "/events", eventsHandlers.GetEventsHandler)
mainRouter.AddRoute("POST", "/event", eventsHandlers.CreateEventHandler)
mainRouter.AddRoute("POST", "/event/respond", eventsHandlers.RespondToEventHandler)
mainRouter.AddRoute("GET", "/event/responses", eventsHandlers.GetEventResponsesHandler)

// Notification routes
mainRouter.AddRoute("GET", "/notifications", notificationsHandlers.GetAllNotificationsHandler)
mainRouter.AddRoute("GET", "/new-notifications", notificationsHandlers.GetNewNotificationsHandler)
mainRouter.AddRoute("POST", "/notification/read", notificationsHandlers.MarkNotificationReadHandler)
mainRouter.AddRoute("GET", "/notifications/unread-count", notificationsHandlers.NotificationCountUnreadHandler)

// Chat routes
mainRouter.AddRoute("GET", "/ws", chatHandlers.InitWebSocketConnectionHandler)
mainRouter.AddRoute("GET", "/chat", chatHandlers.GetChatHandler)
mainRouter.AddRoute("GET", "/chat-group", chatHandlers.GetGroupChatHandler)
mainRouter.AddRoute("GET", "/chats", chatHandlers.GetAllChatsHandler)
mainRouter.AddRoute("GET", "/chat/newusers", chatHandlers.GetNewChatUsersHandler)
mainRouter.AddRoute("POST", "/chat/send", chatHandlers.SendMessageHandler)
mainRouter.AddRoute("POST", "/chat/mark-read", chatHandlers.MarkMessageAsReadHandler)
// mainRouter.AddRoute("POST", "/chat/allow-chat", chatHandlers.CheckIfAllowChat) // commented out
// mainRouter.AddRoute("POST", "/chat/send-group", chatHandlers.SendGroupMessageHandler) // commented out
// mainRouter.AddRoute("GET", "/chat/history", chatHandlers.GetChatHistoryHandler) // commented out
// mainRouter.AddRoute("GET", "/chat/active", chatHandlers.GetActiveChatsHandler) // commented out

// Group invitation routes
mainRouter.AddRoute("POST", "/group/invite", middleware.AuthMiddleware(invitationHandlers.InviteUsersHandler))
mainRouter.AddRoute("POST", "/group/cancel-invite", middleware.AuthMiddleware(invitationHandlers.CancelInvitationHandler))
mainRouter.AddRoute("GET", "/group/invite-list", middleware.AuthMiddleware(invitationHandlers.GetGroupInvitationListHandler))
mainRouter.AddRoute("POST", "/group/invite/accept", invitationHandlers.AcceptInvitationHandler)
mainRouter.AddRoute("POST", "/group/invite/reject", invitationHandlers.RejectInvitationHandler)
mainRouter.AddRoute("POST", "/group/members/remove", invitationHandlers.RemoveMembersHandler)


	// fmt.Println("Routes registered:", mainRouter.Routes)
	fmt.Println("Listening on port: http://localhost:8080/")

	mainError = http.ListenAndServe(":8080", mainRouter)
	if mainError != nil {
		return
	}
}
