import React, { useEffect, useState } from "react"
import { apiFetch } from "./api"
import "./Messages.css"

function Messages() {

  const currentUserId = localStorage.getItem("userId")

  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")

  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)

  const [lastMessages, setLastMessages] = useState({})

  const [contextMenu, setContextMenu] = useState(null)
  const [deleteMessage, setDeleteMessage] = useState(null)
  const [deleting, setDeleting] = useState(false)


  // =========================================
  // LOAD USERS
  // =========================================

  const loadUsers = async () => {

    if (!currentUserId) return

    try {

      const response = await apiFetch(
        `/api/users/suggestions/${currentUserId}`
      )

      if (!response.ok) {
        throw new Error("Failed to load users")
      }

      const data = await response.json()

     

      setUsers(data)

    } catch (error) {

      console.error("Load users error:", error)

    } finally {

      setLoadingUsers(false)

    }
  }


  // =========================================
  // LOAD CONVERSATION
  // =========================================

  const loadMessages = async (userId, showLoading = false) => {

    if (!currentUserId || !userId) return

    try {

      if (showLoading) {
        setLoadingMessages(true)
      }

      const response = await apiFetch(
        `/api/messages/conversation?senderId=${currentUserId}&receiverId=${userId}`
      )

      if (!response.ok) {
        throw new Error("Failed to load messages")
      }

      const data = await response.json()

    

      setMessages(data)

    } catch (error) {

      console.error("Load messages error:", error)

    } finally {

      if (showLoading) {
        setLoadingMessages(false)
      }

    }
  }


  // =========================================
  // MARK INCOMING MESSAGES AS READ
  // =========================================

  const markAsRead = async (userId) => {

    if (!currentUserId || !userId) return

    try {

      const response = await apiFetch(
        `/api/messages/read?receiverId=${currentUserId}&senderId=${userId}`,
        {
          method: "PUT"
        }
      )

      if (!response.ok) {
        throw new Error("Failed to mark messages as read")
      }

      console.log(
        "Messages from",
        userId,
        "marked as READ"
      )

    } catch (error) {

      console.error("Mark read error:", error)

    }
  }


  // =========================================
  // LOAD LAST MESSAGE FOR USERS
  // =========================================

  const loadLastMessages = async () => {

    if (!currentUserId || users.length === 0) return

    const newLastMessages = {}

    for (const user of users) {

      try {

        const response = await apiFetch(
          `/api/messages/conversation?senderId=${currentUserId}&receiverId=${user.id}`
        )

        if (!response.ok) {
          continue
        }

        const data = await response.json()

        if (data.length > 0) {

          const lastMessage =
            data[data.length - 1]

          newLastMessages[user.id] =
            lastMessage.text

        }

      } catch (error) {

        console.error(
          `Failed to load last message for ${user.username}:`,
          error
        )

      }

    }

    setLastMessages(newLastMessages)
  }


  // =========================================
  // INITIAL USERS
  // =========================================

  useEffect(() => {

    loadUsers()

  }, [currentUserId])


  // =========================================
  // LOAD LAST MESSAGES
  // =========================================

  useEffect(() => {

    if (users.length === 0) return

    loadLastMessages()

    const interval = setInterval(() => {

      loadLastMessages()

    }, 5000)

    return () => {

      clearInterval(interval)

    }

  }, [users])


  // =========================================
  // SELECTED CHAT
  // =========================================

  useEffect(() => {

    if (!selectedUser) return

    const userId = selectedUser.id

    // First load
    loadMessages(userId, true)

    // Mark incoming messages as read
    markAsRead(userId)

    // Reload after marking as read
    setTimeout(() => {

      loadMessages(userId)

    }, 300)

    // Poll messages
    const interval = setInterval(() => {

      loadMessages(userId)

    }, 3000)

    return () => {

      clearInterval(interval)

    }

  }, [selectedUser?.id])


  // =========================================
  // SELECT USER
  // =========================================

  const handleSelectUser = async (user) => {

    setSelectedUser(user)

    setContextMenu(null)

    // Clear old conversation immediately
    setMessages([])

    // Mark incoming messages as read
    await markAsRead(user.id)

    // Load conversation
    await loadMessages(user.id, true)

  }


  // =========================================
  // SEND MESSAGE
  // =========================================

  const handleSendMessage = async (e) => {

    e.preventDefault()

    if (!newMessage.trim()) return

    if (!selectedUser) return

    try {

      const response = await apiFetch(
        "/api/messages",
        {
          method: "POST",

          body: JSON.stringify({
            receiverId: selectedUser.id,
            text: newMessage.trim()
          })
        }
      )

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

     

      // Backend returns read:false
      setMessages(prev => [
        ...prev,
        data
      ])

      setNewMessage("")

      // Update left-side last message
      setLastMessages(prev => ({
        ...prev,
        [selectedUser.id]: data.text
      }))

    } catch (error) {

      console.error(
        "Send message error:",
        error
      )

    }

  }


  // =========================================
  // RIGHT CLICK MESSAGE
  // =========================================

  const handleMessageContextMenu = (
    e,
    message
  ) => {

    e.preventDefault()

    setContextMenu(null)

    // Only own message
    // can be deleted
    if (message.senderId !== currentUserId) {
      return
    }

    setContextMenu({
      messageId: message.id,
      x: e.clientX,
      y: e.clientY
    })

  }


  // =========================================
  // DELETE MENU
  // =========================================

  const handleDeleteMenuClick = () => {

    if (!contextMenu) return

    const message = messages.find(
      msg =>
        msg.id === contextMenu.messageId
    )

    if (!message) {

      setContextMenu(null)

      return

    }

    setDeleteMessage(message)

    setContextMenu(null)

  }


  // =========================================
  // CONFIRM DELETE
  // =========================================

  const handleConfirmDelete = async () => {

    if (!deleteMessage) return

    try {

      setDeleting(true)

      const response = await apiFetch(
        `/api/messages/${deleteMessage.id}`,
        {
          method: "DELETE"
        }
      )

      if (!response.ok) {
        throw new Error("Failed to delete message")
      }

     

      setMessages(prev =>
        prev.filter(
          message =>
            message.id !== deleteMessage.id
        )
      )

      // Reload last message
      if (selectedUser) {

        loadMessages(selectedUser.id)

      }

      setDeleteMessage(null)

    } catch (error) {

      console.error(
        "Delete message error:",
        error
      )

      alert("Failed to delete message")

    } finally {

      setDeleting(false)

    }

  }


  // =========================================
  // CLOSE CONTEXT MENU
  // =========================================

  useEffect(() => {

    const handleClickOutside = () => {

      setContextMenu(null)

    }

    document.addEventListener(
      "click",
      handleClickOutside
    )

    return () => {

      document.removeEventListener(
        "click",
        handleClickOutside
      )

    }

  }, [])


  // =========================================
  // ONLINE STATUS
  // =========================================

  useEffect(() => {

    if (!users.length) return

    const checkOnlineStatus = async () => {

      try {

        const updatedUsers = await Promise.all(

          users.map(async user => {

            try {

              const response = await apiFetch(
                `/api/users/${user.id}`
              )

              if (!response.ok) {
                return user
              }

              return await response.json()

            } catch {

              return user

            }

          })

        )

        setUsers(updatedUsers)

      } catch (error) {

        console.error(
          "Online status refresh error:",
          error
        )

      }

    }

    const interval = setInterval(
      checkOnlineStatus,
      5000
    )

    return () => {

      clearInterval(interval)

    }

  }, [users.length])


  // =========================================
  // FIND LAST OWN MESSAGE
  // =========================================

  const getLastOwnMessageIndex = () => {

    let lastIndex = -1

    messages.forEach(
      (message, index) => {

        if (
          message.senderId ===
          currentUserId
        ) {

          lastIndex = index

        }

      }
    )

    return lastIndex

  }


  const lastOwnMessageIndex =
    getLastOwnMessageIndex()


  // =========================================
  // RENDER
  // =========================================

  return (

    <div className="messages-page">


      {/* =====================================
          USERS PANEL
      ===================================== */}

      <div className="messages-users-panel">

        <div className="messages-users-header">

          <h4>Messages</h4>

        </div>


        {loadingUsers ? (

          <div className="messages-loading">

            Loading users...

          </div>

        ) : users.length === 0 ? (

          <div className="messages-no-users">

            No users found

          </div>

        ) : (

          <div className="messages-users-list">

            {users.map(user => (

              <div
                key={user.id}
                className={`messages-user ${
                  selectedUser?.id === user.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelectUser(user)
                }
              >

                {/* PROFILE IMAGE */}

                <div className="messages-user-image-wrapper">

                  <img
                    src={
                      user.profilePic ||
                      "https://via.placeholder.com/55"
                    }
                    alt={
                      user.username ||
                      "User"
                    }
                    className="messages-user-image"
                  />

                  {user.online && (

                    <span className="messages-online-dot"></span>

                  )}

                </div>


                {/* USER DETAILS */}

                <div className="messages-user-details">

                  <div className="messages-user-name">

                    {user.username || "User"}

                  </div>


                  <div className="messages-last-message">

                    {lastMessages[user.id] ||
                      "Start a conversation"}

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* =====================================
          CHAT PANEL
      ===================================== */}

     <div
  className={`messages-chat-panel ${
    selectedUser
      ? "mobile-chat-open"
      : "mobile-chat-closed"
  }`}
>


        {!selectedUser ? (

          <div className="messages-empty-chat">

            <div className="messages-empty-icon">

              <i className="bi bi-chat-dots"></i>

            </div>

            <h4>Your Messages</h4>

            <p>
              Select a user to start chatting
            </p>

          </div>

        ) : (

          <>


            {/* =================================
                CHAT HEADER
            ================================= */}

            <div className="messages-chat-header">

              <button
                className="messages-back-button"
                onClick={() =>
                  setSelectedUser(null)
                }
              >

                <i className="bi bi-arrow-left"></i>

              </button>


              <img
                src={
                  selectedUser.profilePic ||
                  "https://via.placeholder.com/45"
                }
                alt={
                  selectedUser.username ||
                  "User"
                }
                className="messages-chat-profile"
              />


              <div className="messages-chat-user-info">

                <div className="messages-chat-username">

                  {selectedUser.username ||
                    "User"}

                </div>


                <div className="messages-chat-status">

                  {selectedUser.online
                    ? "Active now"
                    : "Offline"}

                </div>

              </div>

            </div>


            {/* =================================
                CHAT BODY
            ================================= */}

            <div className="messages-chat-body">

              {loadingMessages &&
              messages.length === 0 ? (

                <div className="messages-loading">

                  Loading messages...

                </div>

              ) : messages.length === 0 ? (

                <div className="messages-empty-conversation">

                  <p>
                    No messages yet
                  </p>

                  <small>
                    Send a message to start
                    the conversation
                  </small>

                </div>

              ) : (

                messages.map(
                  (message, index) => {

                    const isOwnMessage =
                      message.senderId ===
                      currentUserId


                    /*
                      Find ONLY the last
                      message sent by me.
                    */

                    const isLastOwnMessage =
                      isOwnMessage &&
                      index ===
                        lastOwnMessageIndex


                    return (

                      <div
                        key={message.id}
                        className={`messages-message ${
                          isOwnMessage
                            ? "own"
                            : "other"
                        }`}
                        onContextMenu={(e) =>
                          handleMessageContextMenu(
                            e,
                            message
                          )
                        }
                      >

                        <div className="messages-message-wrapper">

                          <div className="messages-message-bubble">

                            {message.text}

                          </div>


                          {/* =================================
                              READ STATUS
                              ONLY LAST OWN MESSAGE
                          ================================= */}

                          {isLastOwnMessage &&
                          message.read === true && (

                            <span className="messages-read-status">

                              Read

                            </span>

                          )}

                        </div>

                      </div>

                    )

                  }
                )

              )}

            </div>


            {/* =================================
                MESSAGE INPUT
            ================================= */}

            <form
              className="messages-input-area"
              onSubmit={handleSendMessage}
            >

              <input
                type="text"
                placeholder="Message..."
                value={newMessage}
                onChange={(e) =>
                  setNewMessage(e.target.value)
                }
              />


              <button
                type="submit"
                disabled={!newMessage.trim()}
              >

                Send

              </button>

            </form>

          </>

        )}

      </div>


      {/* =====================================
          CONTEXT MENU
      ===================================== */}

      {contextMenu && (

        <div
          className="messages-context-menu"
          style={{
            position: "fixed",
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`
          }}
          onClick={(e) =>
            e.stopPropagation()
          }
        >

          <button
            className="messages-context-delete"
            onClick={handleDeleteMenuClick}
          >

            <i className="bi bi-trash3"></i>

            Delete message

          </button>

        </div>

      )}


      {/* =====================================
          DELETE MODAL
      ===================================== */}

      {deleteMessage && (

        <div
          className="messages-delete-overlay"
          onClick={() => {

            if (!deleting) {

              setDeleteMessage(null)

            }

          }}
        >

          <div
            className="messages-delete-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="messages-delete-icon">

              <i className="bi bi-trash3"></i>

            </div>


            <h5>
              Delete message?
            </h5>


            <p>
              Are you sure you want to
              delete this message?
            </p>


            <div className="messages-delete-actions">

              <button
                className="messages-delete-cancel"
                onClick={() =>
                  setDeleteMessage(null)
                }
                disabled={deleting}
              >

                Cancel

              </button>


              <button
                className="messages-delete-confirm"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >

                {deleting
                  ? "Deleting..."
                  : "Delete"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  )

}

export default Messages