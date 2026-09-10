import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {

  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {

    e.preventDefault()

    setError("")
    setLoading(true)

    try {

      const response = await fetch(
        "https://instagram-backend-weov.onrender.com/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: username,
            password: password
          })
        }
      )

      if (!response.ok) {
        throw new Error("Invalid username or password")
      }

      const data = await response.json()

     

      // Save JWT
      localStorage.setItem("token", data.token)

      // Save logged-in user details
      localStorage.setItem("userId", data.userId)
      localStorage.setItem("username", data.username)

      // Go to home
      navigate("/")

    } catch (error) {

      console.error("Login error:", error)
      setError(error.message)

    } finally {

      setLoading(false)

    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">

      <div
        className="border rounded p-4"
        style={{ width: "350px" }}
      >

        <h2 className="text-center mb-4">
        Instagram
        </h2>

        <form onSubmit={handleLogin}>

          {/* Username */}

          <input
            type="text"
            className="form-control mb-3"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            required
          />


          {/* Password */}

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />


          {/* Error */}

          {error && (
            <p className="text-danger">
              {error}
            </p>
          )}


          {/* Login */}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>


          {/* Create Account */}

          <div className="text-center mt-3">

            <span className="text-muted">
              Don't have an account?{" "}
            </span>

            <button
              type="button"
              className="btn btn-link p-0"
              onClick={() =>
                navigate("/register")
              }
            >
              Create new account
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}

export default Login