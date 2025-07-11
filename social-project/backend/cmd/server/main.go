package main

import (
	"backend/pkg/api"
	"backend/pkg/api/post"
	"backend/pkg/db/sqlite"
	"backend/pkg/middleware"
	"log"
	"net/http"
)

func main() {
	db, err := sqlite.ConnectDatabase()
	if err != nil {
		log.Fatalf("Could not connect to database: %v\n", err)
	}
	defer sqlite.CloseDB()

	if err := sqlite.ApplyMigrations(db); err != nil {
		log.Fatalf("Could not apply migrations: %v\n", err)
	}

	appCore := middleware.NewAppCore(db)
	defer appCore.Close()

	go appCore.Hub.Run()

	mux := http.NewServeMux()

	// Authentication routes
	mux.HandleFunc("/login", api.LoginHandler)
	mux.HandleFunc("/signup", api.RegisterHandler)
	mux.HandleFunc("/api/logout", api.LogoutHandler)
	mux.HandleFunc("/api/check-session", api.CheckSessionHandler)

	// User routes
	mux.HandleFunc("/api/user/", api.GetUserHandler)
	mux.HandleFunc("/api/users", api.GetUsersHandler)
	mux.HandleFunc("/images", api.GetImageHandler)
	mux.HandleFunc("/api/user/update", api.UpdateUserHandler)
	mux.HandleFunc("/api/top-engaged-users", api.GetTopEngagedUsersHandler)
	mux.HandleFunc("/api/user/posts", post.GetUserPostsHandler)
	// Post routes
	mux.HandleFunc("/api/posts", post.GetPostsHandler)
	mux.HandleFunc("/api/post", post.CreatePostHandler(appCore))
	mux.HandleFunc("/api/post/update", post.UpdatePostHandler)
	mux.HandleFunc("/api/post/delete", post.DeletePostHandler(appCore))
	mux.HandleFunc("/api/post/single", post.GetSinglePostHandler)

	// Add these new routes for group posts
	mux.HandleFunc("/api/group/post", post.CreateGroupPostHandler(appCore))
	mux.HandleFunc("/api/group/posts", post.GetGroupPostsHandler)

	// Comment routes
	mux.HandleFunc("/api/comments", post.GetCommentsHandler)
	mux.HandleFunc("/api/comment", post.AddCommentHandler(appCore))
	mux.HandleFunc("/api/comment/update", post.UpdateCommentHandler)
	//mux.HandleFunc("/api/comment/delete", post.DeleteCommentHandler(appCore))

	// Add new reaction routes
	mux.HandleFunc("/api/react", middleware.AuthMiddleware(api.ReactHandler(appCore)))
	mux.HandleFunc("/api/reactions", middleware.AuthMiddleware(api.GetAvailableReactionsHandler))

	// Group routes
	mux.HandleFunc("/api/groups", middleware.AuthMiddleware(api.GetGroupsHandler))
	mux.HandleFunc("/api/group", middleware.AuthMiddleware(api.GetGroupHandler))
	mux.HandleFunc("/api/group/details", middleware.AuthMiddleware(api.GetGroupDetailsHandler))
	mux.HandleFunc("/api/group-requests", api.GroupRequestHandler)
	mux.HandleFunc("/api/group-joinRequests", api.GroupJoinRequestHandler(appCore))
	mux.HandleFunc("/api/group/create", api.CreateGroupHandler(appCore))
	mux.HandleFunc("/api/group/update", middleware.AuthMiddleware(api.UpdateGroupHandler))
	mux.HandleFunc("/api/group/delete", middleware.AuthMiddleware(api.DeleteGroupHandler(appCore)))

	// Update the Follow routes to pass appCore
	mux.HandleFunc("/api/Follow", api.InitFollowHandler(appCore))
	mux.HandleFunc("/api/Following/", api.FollowingHandler)
	mux.HandleFunc("/api/Followers/", api.FollowersHandler)
	mux.HandleFunc("/api/Follow-requests", api.FollowRequestHandler)
	// Add this line in the appropriate place in your route definitions
	mux.HandleFunc("/followers", api.GetFollowersHandler)

	// Event routes
	mux.HandleFunc("/api/events", api.GetEventsHandler)
	mux.HandleFunc("/api/event", api.CreateEventHandler(appCore))
	mux.HandleFunc("/api/event/respond", api.RespondToEventHandler)
	mux.HandleFunc("/api/event/responses", api.GetEventResponsesHandler)


	// Notification routes
	mux.HandleFunc("/api/notifications", api.GetAllNotificationsHandler)
	mux.HandleFunc("/api/new-notifications", api.GetNewNotificationsHandler)
	mux.HandleFunc("/api/notification/read", api.MarkNotificationReadHandler)
	mux.HandleFunc("/api/notifications/unread-count", api.NotificationCountUnreadHandler)


	// Chat routes
	mux.HandleFunc("/ws", api.InitWebSocketConnectionHandler(appCore.Hub))
	mux.HandleFunc("/api/chat", api.GetChatHandler)
	mux.HandleFunc("/api/chat-group", api.GetGroupChatHandler)
	mux.HandleFunc("/api/chats", api.GetAllChatsHandler)
	mux.HandleFunc("/api/chat/newusers", api.GetNewChatUsersHandler)
	mux.HandleFunc("/api/chat/send", api.SendMessageHandler(appCore))
	mux.HandleFunc("/api/chat/mark-read", api.MarkMessageAsReadHandler)
	//mux.HandleFunc("/api/chat/allow-chat", api.CheckIfAllowChat)
	//mux.HandleFunc("/api/chat/send-group", api.SendGroupMessageHandler(appCore))
	//mux.HandleFunc("/api/chat/history", api.GetChatHistoryHandler)
	//mux.HandleFunc("/api/chat/active", api.GetActiveChatsHandler)

	// Group invitation routes
	mux.HandleFunc("/api/group/invite", middleware.AuthMiddleware(api.InviteUsersHandler(appCore)))
	mux.HandleFunc("/api/group/cancel-invite", middleware.AuthMiddleware(api.CancelInvitationHandler(appCore)))
	mux.HandleFunc("/api/group/invite-list", middleware.AuthMiddleware(api.GetGroupInvitationListHandler))
	mux.HandleFunc("/api/group/invite/accept", api.AcceptInvitationHandler)
	mux.HandleFunc("/api/group/invite/reject", api.RejectInvitationHandler)
	mux.HandleFunc("/api/group/members/remove", api.RemoveMembersHandler)

	// Apply middlewares
	handler := middleware.CorsMiddleware(mux)
	rateLimiter := middleware.NewRateLimiter()
	handler = rateLimiter.RateLimitMiddleware(handler)
	handler = middleware.ErrorHandlerMiddleware(handler)

	log.Println("Starting server on :8080")
	err = http.ListenAndServe(":8080", handler)
	if err != nil {
		log.Fatalf("Could not start server: %v\n", err)
	}

}
