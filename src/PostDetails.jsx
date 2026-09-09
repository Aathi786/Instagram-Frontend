import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { apiFetch } from "./api"

function PostDetails() {

  const { postId } = useParams()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)


  // =========================
  // LOAD POST
  // =========================

  useEffect(() => {

    const loadPost = async () => {

      try {

        const response = await apiFetch(
          `/api/posts/${postId}`
        )

        if (!response.ok) {
          throw new Error("Post not found")
        }

        const data = await response.json()

        

        setPost(data)

      } catch (error) {

        console.error(
          "Post details error:",
          error
        )

      } finally {

        setLoading(false)

      }

    }

    loadPost()

  }, [postId])


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <div className="post-details-page">

        <div className="post-details-container">

          <h4 className="text-center">
            Loading post...
          </h4>

        </div>

      </div>
    )

  }


  // =========================
  // POST NOT FOUND
  // =========================

  if (!post) {

    return (
      <div className="post-details-page">

        <div className="post-details-container text-center">

          <h4>
            Post not found
          </h4>

          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>

        </div>

      </div>
    )

  }


  // =========================
  // UI
  // =========================

  return (

    <div className="post-details-page">

      <div className="post-details-container">

        {/* BACK BUTTON */}

        <button
          className="btn btn-outline-secondary post-back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>


        {/* POST CARD */}

        <div className="post-details-card">

          {/* POST IMAGE */}

          <img
            src={post.imageUrl}
            alt="post"
            className="post-details-image"
          />


          {/* POST DETAILS */}

          <div className="post-details-body">

            {post.caption && (

              <p className="post-details-caption">
                {post.caption}
              </p>

            )}


            <small className="post-details-id">
              Post ID: {post.id}
            </small>

          </div>

        </div>

      </div>

    </div>

  )

}

export default PostDetails