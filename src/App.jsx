import React, { useEffect } from 'react'
import Sidebar from './Sidebar'
import Feed from './Feed'
import Suggestions from './Suggestions'
import { apiFetch } from './api'

function App() {

  const currentUserId = localStorage.getItem("userId")

  useEffect(() => {

    if (!currentUserId) {
      return
    }

    const setOnline = async () => {
      try {
        const response = await apiFetch(
          `/api/users/status/${currentUserId}?online=true`,
          {
            method: "PUT"
          }
        )

        if (!response.ok) {
          throw new Error("Failed to set online status")
        }

        console.log("User is ONLINE")

      } catch (error) {
        console.error("Error setting online status:", error)
      }
    }

    const setOffline = async () => {
      try {
        const response = await apiFetch(
          `/api/users/status/${currentUserId}?online=false`,
          {
            method: "PUT",
            keepalive: true
          }
        )

        if (!response.ok) {
          throw new Error("Failed to set offline status")
        }

        console.log("User is OFFLINE")

      } catch (error) {
        console.error("Error setting offline status:", error)
      }
    }

    // User online
    setOnline()

    // Heartbeat every 10 seconds
    const heartbeat = setInterval(() => {
      setOnline()
    }, 10000)

    // User leaves/closes page
    window.addEventListener("beforeunload", setOffline)

    return () => {
      clearInterval(heartbeat)
      window.removeEventListener("beforeunload", setOffline)
    }

  }, [currentUserId])


  return (

    <div className="instagram-app">

      {/* Sidebar */}

      <div className="sidebar-area">
        <Sidebar />
      </div>


      {/* Main Feed */}

      <main className="feed-area">
        <Feed />
      </main>


      {/* Suggestions */}

      <aside className="suggestions-area">
        <Suggestions />
      </aside>

    </div>

  )
}

export default App