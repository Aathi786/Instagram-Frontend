import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from './api'

function CreatePost() {

  const navigate = useNavigate()

  const [imageUrl, setImageUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [loading, setLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  const userId = localStorage.getItem("userId")


  // =========================
  // CREATE POST
  // =========================

  const handleCreatePost = async () => {

    if (!imageUrl.trim()) {
      alert("Please enter image URL")
      return
    }

    try {

      setLoading(true)

      const response = await apiFetch(
        "/api/posts",
        {
          method: "POST",
          body: JSON.stringify({
            userId: userId,
            imageUrl: imageUrl.trim(),
            caption: caption
          })
        }
      )

      if (!response.ok) {
        throw new Error("Post creation failed")
      }

      alert("Post created successfully 🔥")

      setImageUrl("")
      setCaption("")

      navigate("/")

    } catch (error) {

      console.log(
        "Create post error:",
        error
      )

      alert("Failed to create post")

    } finally {

      setLoading(false)

    }
  }


  // =========================
  // IMAGE URL CHANGE
  // =========================

  const handleImageUrlChange = (e) => {

    setImageUrl(e.target.value)
    setImageError(false)

  }


  // =========================
  // UI
  // =========================

  return (

    <div className="create-post-page">

      <div className="create-post-container">

        {/* HEADER */}

        <div className="create-post-header">

          <h3>
            Create Post
          </h3>

          <button
            className="btn btn-light"
            onClick={() => navigate("/")}
          >
            ✕
          </button>

        </div>


        {/* IMAGE URL */}

        <label className="create-post-label">
          Image URL
        </label>

        <input
          type="text"
          className="form-control create-post-input"
          placeholder="Enter image URL"
          value={imageUrl}
          onChange={handleImageUrlChange}
        />


        {/* IMAGE PREVIEW */}

        {imageUrl.trim() && !imageError && (

          <div className="create-post-preview">

            <img
              src={imageUrl}
              alt="Preview"
              onError={() => setImageError(true)}
            />

          </div>

        )}

        {imageError && (

          <p className="text-danger small mt-2">
            Invalid image URL
          </p>

        )}


        {/* CAPTION */}

        <label className="create-post-label caption-label">
          Caption
        </label>

        <textarea
          className="form-control create-post-textarea"
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) =>
            setCaption(e.target.value)
          }
        />


        {/* CREATE BUTTON */}

        <button
          className="btn btn-primary create-post-button"
          onClick={handleCreatePost}
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "Create Post"}
        </button>

      </div>

    </div>

  )
}

export default CreatePost