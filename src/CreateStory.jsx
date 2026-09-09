import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "./api"

function CreateStory() {

  const navigate = useNavigate()

  const [imageUrl, setImageUrl] = useState("")
  const [preview, setPreview] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)

  const currentUserId =
    localStorage.getItem("userId")


  // =========================
  // LOAD LOGGED-IN USER
  // =========================

  useEffect(() => {

    const loadUser = async () => {

      if (!currentUserId) {
        return
      }

      try {

        const response =
          await apiFetch(
            `/api/users/${currentUserId}`
          )

        if (!response.ok) {
          throw new Error(
            "Failed to load user"
          )
        }

        const data =
          await response.json()

        

        setUser(data)

      } catch (error) {

        console.error(
          "Load user error:",
          error
        )

      }

    }

    loadUser()

  }, [currentUserId])


  // =========================
  // IMAGE URL CHANGE
  // =========================

  const handleImageChange = (e) => {

    const value =
      e.target.value

    setImageUrl(value)
    setPreview(value)
    setError("")

  }


  // =========================
  // CREATE STORY
  // =========================

  const handleCreateStory = async (e) => {

    e.preventDefault()

    if (!imageUrl.trim()) {

      setError(
        "Please enter an image URL"
      )

      return

    }

    setLoading(true)
    setError("")

    try {

      const response =
        await apiFetch(
          "/api/stories",
          {
            method: "POST",

            body: JSON.stringify({
              imageUrl:
                imageUrl.trim()
            })
          }
        )

      if (!response.ok) {

        throw new Error(
          "Failed to create story"
        )

      }

      const data =
        await response.json()

      

      alert(
        "Story created successfully!"
      )

      navigate("/")

    } catch (error) {

      console.error(
        "Create story error:",
        error
      )

      setError(
        "Failed to create story"
      )

    } finally {

      setLoading(false)

    }

  }


  // =========================
  // UI
  // =========================

  return (

    <div className="create-story-page">

      <div className="create-story-container">


        {/* =========================
            HEADER
        ========================= */}

        <div className="create-story-header">

          <h3>
            Create Story
          </h3>

          <button
            className="btn btn-sm btn-light"
            onClick={() =>
              navigate("/")
            }
          >
            ✕
          </button>

        </div>


        {/* =========================
            USER PROFILE
        ========================= */}

        {user && (

          <div className="create-story-user">

            <img
              src={
                user.profilePic ||
                "https://via.placeholder.com/50"
              }
              alt={
                user.username ||
                "User"
              }
              className="create-story-profile-pic"
            />

            <div className="create-story-user-info">

              <div className="create-story-username">
                {user.username || "User"}
              </div>

              <div className="text-muted create-story-subtitle">
                Add to your story
              </div>

            </div>

          </div>

        )}


        {/* =========================
            PREVIEW
        ========================= */}

        {preview && (

          <div className="create-story-preview">

            <img
              src={preview}
              alt="Story preview"
              className="create-story-preview-image"
              onError={() => {

                setError(
                  "Invalid image URL"
                )

              }}
            />

          </div>

        )}


        {/* =========================
            FORM
        ========================= */}

        <form
          onSubmit={handleCreateStory}
        >

          <label className="create-story-label">
            Image URL
          </label>

          <input
            type="text"
            className="form-control create-story-input"
            placeholder="Paste image URL..."
            value={imageUrl}
            onChange={handleImageChange}
          />


          {error && (

            <p className="text-danger small create-story-error">
              {error}
            </p>

          )}


          <button
            type="submit"
            className="btn btn-primary create-story-button"
            disabled={loading}
          >

            {loading
              ? "Creating..."
              : "Add to Story"}

          </button>

        </form>

      </div>

    </div>

  )

}

export default CreateStory