import React from "react"
import { Navigate } from "react-router-dom"

function ProtectedRoute({ children }) {

  const token = localStorage.getItem("token")

  // No token
  if (!token) {
    return <Navigate to="/login" replace />
  }

  try {

    const parts = token.split(".")

    // JWT must contain:
    // header.payload.signature

    if (parts.length !== 3) {
      throw new Error("Invalid JWT format")
    }

    const payload = JSON.parse(
      atob(parts[1])
    )

    // JWT must have expiry
    if (!payload.exp) {
      throw new Error("JWT expiry missing")
    }

    const currentTime = Date.now() / 1000

    // Token expired
    if (payload.exp <= currentTime) {

      console.log("JWT expired")

      localStorage.removeItem("token")
      localStorage.removeItem("userId")
      localStorage.removeItem("username")

      return <Navigate to="/login" replace />
    }

    // Token valid
    return children

  } catch (error) {

    console.error("Invalid JWT:", error)

    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("username")

    return <Navigate to="/login" replace />
  }
}

export default ProtectedRoute