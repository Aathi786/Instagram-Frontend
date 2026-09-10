import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

function CreateAccount() {

  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {

    e.preventDefault()

    setError("")
    setSuccess("")

    // Check password
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Minimum password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {

      const response = await fetch(
        "https://instagram-backend-weov.onrender.com/api/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            password: password
          })
        }
      )

      const data = await response.json()

      

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create account"
        )
      }

      setSuccess(
        "Account created successfully!"
      )

      // Go to login after successful registration
      setTimeout(() => {
        navigate("/login")
      }, 1500)

    } catch (error) {

      console.error("Registration error:", error)

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

        {/* Title */}

        <h2 className="text-center mb-2">
         Instagram
        </h2>

        <p className="text-center text-muted mb-4">
          Create a new account
        </p>


        {/* Register Form */}

        <form onSubmit={handleRegister}>

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


          {/* Email */}

          <input
            type="email"
            className="form-control mb-3"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
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


          {/* Confirm Password */}

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            required
          />


          {/* Error */}

          {error && (
            <p className="text-danger small">
              {error}
            </p>
          )}


          {/* Success */}

          {success && (
            <p className="text-success small">
              {success}
            </p>
          )}


          {/* Create Account Button */}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>


          {/* Login Link */}

          <div className="text-center mt-3">

            <span className="text-muted">
              Already have an account?{" "}
            </span>

            <button
              type="button"
              className="btn btn-link p-0"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}

export default CreateAccount