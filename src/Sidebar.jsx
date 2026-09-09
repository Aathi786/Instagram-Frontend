import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "./api"

function Sidebar() {

  const navigate = useNavigate()

  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const [searchText, setSearchText] = useState("")
  const [searchResults, setSearchResults] = useState([])

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const [currentUser, setCurrentUser] = useState(null)

  const currentUserId = localStorage.getItem("userId")


  /* =========================
     LOAD CURRENT USER
  ========================= */

  useEffect(() => {

    const loadCurrentUser = async () => {

      if (!currentUserId) {
        return
      }

      try {

        const response = await apiFetch(
          `/api/users/${currentUserId}`
        )

        if (!response.ok) {
          throw new Error("Failed to load current user")
        }

        const data = await response.json()

        setCurrentUser(data)

      } catch (error) {

        console.error(
          "Current user error:",
          error
        )

      }

    }

    loadCurrentUser()

  }, [currentUserId])


  /* =========================
     SEARCH
  ========================= */

  useEffect(() => {

    if (!searchText.trim()) {

      setSearchResults([])

      return

    }

    const searchUsers = async () => {

      try {

        const response = await apiFetch(
          `/api/users/search?username=${encodeURIComponent(searchText)}`
        )

        if (!response.ok) {
          throw new Error("Search failed")
        }

        const data = await response.json()

        setSearchResults(data)

      } catch (error) {

        console.error(
          "Search error:",
          error
        )

      }

    }

    const timer = setTimeout(() => {

      searchUsers()

    }, 300)

    return () => clearTimeout(timer)

  }, [searchText])


  /* =========================
     GET SENDER USERNAME
  ========================= */

  const getSenderUsername = async (senderId) => {

    if (!senderId) {
      return "User"
    }

    try {

      const response = await apiFetch(
        `/api/users/${senderId}`
      )

      if (!response.ok) {
        return "User"
      }

      const user = await response.json()

      return user.username || "User"

    } catch (error) {

      console.error(
        "Sender username error:",
        error
      )

      return "User"

    }

  }


  /* =========================
     LOAD NOTIFICATIONS
  ========================= */

  const loadNotifications = async () => {

    if (!currentUserId) {
      return
    }

    try {

      const response = await apiFetch(
        `/api/notifications/${currentUserId}`
      )

      if (!response.ok) {
        throw new Error(
          "Failed to load notifications"
        )
      }

      const data = await response.json()


      /* =========================
         ADD SENDER USERNAME
      ========================= */

      const notificationsWithUsernames =
        await Promise.all(

          data.map(async (notification) => {

            if (!notification.senderId) {

              return {
                ...notification,
                username: "User"
              }

            }

            const username =
              await getSenderUsername(
                notification.senderId
              )

            return {
              ...notification,
              username: username
            }

          })

        )


      setNotifications(
        notificationsWithUsernames
      )


      /* =========================
         UNREAD COUNT
      ========================= */

      const unread =
        notificationsWithUsernames.filter(
          notification =>
            !notification.read
        ).length

      setUnreadCount(unread)

    } catch (error) {

      console.error(
        "Notification error:",
        error
      )

    }

  }


  /* =========================
     NOTIFICATION REFRESH
  ========================= */

  useEffect(() => {

    loadNotifications()

    const interval =
      setInterval(() => {

        loadNotifications()

      }, 10000)

    return () => {

      clearInterval(interval)

    }

  }, [currentUserId])


  /* =========================
     OPEN SEARCH
  ========================= */

  const handleSearchClick = () => {

    setShowNotifications(false)

    setShowSearch(true)

  }


  /* =========================
     OPEN NOTIFICATIONS
  ========================= */

  const handleNotificationClick = () => {

    setShowSearch(false)

    setShowNotifications(true)

    loadNotifications()

  }


  /* =========================
     CLOSE PANELS
  ========================= */

  const closePanels = () => {

    setShowSearch(false)

    setShowNotifications(false)

    setSearchText("")

    setSearchResults([])

  }


  /* =========================
     LOGOUT
  ========================= */

const handleLogout = () => {

  localStorage.removeItem("token")
  localStorage.removeItem("userId")
  localStorage.removeItem("username")

  navigate("/login")

}


  /* =========================
     NAVIGATION
  ========================= */

  const goHome = () => {

    closePanels()

    navigate("/")

  }


  const goCreate = () => {

    closePanels()

    navigate("/create")

  }


  const goMessages = () => {

    closePanels()

    navigate("/messages")

  }


  const goProfile = () => {

    closePanels()

    navigate("/profile")

  }


  return (
    <>


      {/* ==================================================
          DESKTOP SIDEBAR
      ================================================== */}

      <div className="m-3 desktop-sidebar">


        {/* LOGO */}

        <div
          className="mb-4"
          style={{
            cursor: "pointer"
          }}
          onClick={goHome}
        >

          <h3 className="fw-bold">
            Instagram
          </h3>

        </div>


        {/* HOME */}

        <div
          className="sidebar-menu-item"
          onClick={goHome}
        >

          <i className="bi bi-house-door"></i>

          <span>
            Home
          </span>

        </div>


        {/* SEARCH */}

        <div
          className="sidebar-menu-item"
          onClick={handleSearchClick}
        >

          <i className="bi bi-search"></i>

          <span>
            Search
          </span>

        </div>


        {/* CREATE */}

        <div
          className="sidebar-menu-item"
          onClick={goCreate}
        >

          <i className="bi bi-plus-square"></i>

          <span>
            Create
          </span>

        </div>


        {/* MESSAGES */}

        <div
          className="sidebar-menu-item"
          onClick={goMessages}
        >

          <i className="bi bi-messenger"></i>

          <span>
            Messages
          </span>

        </div>


        {/* NOTIFICATIONS */}

        <div
          className="sidebar-menu-item position-relative"
          onClick={handleNotificationClick}
        >

          <i className="bi bi-heart"></i>

          <span>
            Notifications
          </span>


          {unreadCount > 0 && (

            <span className="sidebar-notification-badge">
              {unreadCount}
            </span>

          )}

        </div>


        {/* PROFILE */}

        <div
          className="sidebar-menu-item"
          onClick={goProfile}
        >

          <i className="bi bi-person-circle"></i>

          <span>
            Profile
          </span>

        </div>


        {/* LOGOUT */}

        <div
          className="sidebar-menu-item text-danger"
          onClick={handleLogout}
        >

          <i className="bi bi-box-arrow-right"></i>

          <span>
            Logout
          </span>

        </div>

      </div>


      {/* ==================================================
          SEARCH PANEL
      ================================================== */}

      {showSearch && (

        <div className="sidebar-search-panel position-fixed bg-white shadow">


          <div className="d-flex justify-content-between align-items-center mb-4">

            <h4 className="mb-0">
              Search
            </h4>

            <button
              className="btn btn-sm btn-light"
              onClick={closePanels}
            >
              ✕
            </button>

          </div>


          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search users..."
            value={searchText}
            onChange={(e) =>
              setSearchText(e.target.value)
            }
            autoFocus
          />


          <div>

            {searchResults.length > 0 ? (

              searchResults.map(user => (

                <div
                  key={user.id}
                  className="d-flex align-items-center mb-3"
                  style={{
                    cursor: "pointer",
                    gap: "10px"
                  }}
                  onClick={() => {

                    closePanels()

                    navigate(
                      `/user/${user.id}`
                    )

                  }}
                >

                  <img
                    src={
                      user.profilePic ||
                      "https://via.placeholder.com/45"
                    }
                    alt={user.username}
                    className="rounded-circle"
                    style={{
                      width: "45px",
                      height: "45px",
                      objectFit: "cover"
                    }}
                  />


                  <div>

                    <div className="fw-bold">
                      {user.username}
                    </div>

                    <small className="text-muted">
                      View profile
                    </small>

                  </div>

                </div>

              ))

            ) : searchText.trim() ? (

              <p className="text-muted">
                No users found
              </p>

            ) : (

              <p className="text-muted">
                Search for users
              </p>

            )}

          </div>

        </div>

      )}


      {/* ==================================================
          NOTIFICATION PANEL
      ================================================== */}

      {showNotifications && (

        <div className="sidebar-notification-panel position-fixed bg-white shadow">


          <div className="d-flex justify-content-between align-items-center mb-4">

            <h4 className="mb-0">
              Notifications
            </h4>

            <button
              className="btn btn-sm btn-light"
              onClick={closePanels}
            >
              ✕
            </button>

          </div>


          {notifications.length > 0 ? (

            notifications.map(notification => (

              <div
                key={notification.id}
                className="notification-item d-flex align-items-start mb-3"
              >

                <div>

                  <div>

                    {/* RECEIVER / CURRENT USER */}

                    <b>
                      {currentUser?.username || "User"}
                    </b>


                    {" "}


                    {/* SENDER */}

                    <b>
                      {notification.username || "User"}
                    </b>


                    {" "}


                    {/* MESSAGE */}

                    <span>
                      {notification.type === "FOLLOW"
                        ? "started following you"
                        : notification.message}
                    </span>

                  </div>


                  <small className="text-muted">

                    {notification.createdAt
                      ? new Date(
                          notification.createdAt
                        ).toLocaleString()
                      : ""}

                  </small>

                </div>

              </div>

            ))

          ) : (

            <p className="text-muted">
              No notifications
            </p>

          )}

        </div>

      )}


      {/* ==================================================
          MOBILE BOTTOM NAVIGATION
      ================================================== */}

      <div className="mobile-bottom-nav">


        {/* HOME */}

        <div
          className="mobile-nav-item"
          onClick={goHome}
        >

          <i className="bi bi-house-door"></i>

          <span>
            Home
          </span>

        </div>


        {/* SEARCH */}

        <div
          className="mobile-nav-item"
          onClick={handleSearchClick}
        >

          <i className="bi bi-search"></i>

          <span>
            Search
          </span>

        </div>


        {/* CREATE */}

        <div
          className="mobile-nav-item"
          onClick={goCreate}
        >

          <i className="bi bi-plus-square"></i>

          <span>
            Create
          </span>

        </div>


        {/* MESSAGES */}

        <div
          className="mobile-nav-item"
          onClick={goMessages}
        >

          <i className="bi bi-messenger"></i>

          <span>
            Messages
          </span>

        </div>


        {/* PROFILE */}

        <div
          className="mobile-nav-item"
          onClick={goProfile}
        >

          <i className="bi bi-person-circle"></i>

          <span>
            Profile
          </span>

        </div>

      </div>

    </>
  )

}

export default Sidebar