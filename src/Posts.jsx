import React, { useEffect, useState } from 'react'
import { getFeed } from './feedService'
import { apiFetch } from './api'

function Posts() {

  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState({})
  const [commentText, setCommentText] = useState({})
  const [openComments, setOpenComments] = useState({})

  const userId = localStorage.getItem("userId")

  useEffect(() => {

    const loadFeed = async () => {

      try {

        const data = await getFeed(userId)
        setPosts(data)

      } catch (err) {

        console.log("Feed error:", err)

      }

    }

    loadFeed()

  }, [userId])


  const handleLike = async (postId, liked) => {

    try {

      if (!liked) {

        const response = await apiFetch(
          '/api/likes',
          {
            method: 'POST',
            body: JSON.stringify({
              postId: postId,
              userId: userId
            })
          }
        )

        if (!response.ok) {
          throw new Error("Like failed")
        }

      } else {

        const response = await apiFetch(
          `/api/likes?postId=${postId}&userId=${userId}`,
          {
            method: 'DELETE'
          }
        )

        if (!response.ok) {
          throw new Error("Unlike failed")
        }

      }

      const updatedFeed = await getFeed(userId)
      setPosts(updatedFeed)

    } catch (error) {

      console.log("Like error:", error)

    }

  }


  const loadComments = async (postId) => {

    try {

      const response = await apiFetch(
        `/api/comments/post/${postId}`
      )

      if (!response.ok) {
        throw new Error("Failed to load comments")
      }

      const data = await response.json()

      setComments(prev => ({
        ...prev,
        [postId]: data
      }))

    } catch (error) {

      console.log("Comment load error:", error)

    }

  }


  const toggleComments = async (postId) => {

    const isOpen = openComments[postId]

    setOpenComments(prev => ({
      ...prev,
      [postId]: !isOpen
    }))

    if (!isOpen) {
      await loadComments(postId)
    }

  }


  const handleComment = async (postId) => {

    const text = commentText[postId]

    if (!text || text.trim() === "") {
      return
    }

    try {

      const response = await apiFetch(
        '/api/comments',
        {
          method: 'POST',
          body: JSON.stringify({
            postId: postId,
            userId: userId,
            text: text.trim()
          })
        }
      )

      if (!response.ok) {
        throw new Error("Comment failed")
      }

      setCommentText(prev => ({
        ...prev,
        [postId]: ""
      }))

      await loadComments(postId)

      const updatedFeed = await getFeed(userId)
      setPosts(updatedFeed)

    } catch (error) {

      console.log("Comment error:", error)

    }

  }


  const handleDeleteComment = async (commentId, postId) => {

    try {

      const response = await apiFetch(
        `/api/comments/${commentId}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error("Delete comment failed")
      }

      await loadComments(postId)

      const updatedFeed = await getFeed(userId)
      setPosts(updatedFeed)

    } catch (error) {

      console.log("Delete comment error:", error)

    }

  }


  return (

    <div className="posts-container">

      {posts.length > 0 ? (

        posts.map((post) => (

          <article
            className="post-card"
            key={post.postId}
          >

            {/* USER */}

            <div className="post-user">

              <img
                className="post-profile-pic"
                src={post.profilePic}
                alt="profile"
              />

              <h5 className="post-username">
                {post.username}
              </h5>

            </div>


            {/* IMAGE */}

            <img
              className="post-image"
              src={post.imageUrl}
              alt="post"
            />


            {/* ACTIONS */}

            <div className="post-actions">

              <button
                className="post-action-button"
                onClick={() =>
                  handleLike(
                    post.postId,
                    post.likedByCurrentUser
                  )
                }
              >

                <i
                  className={
                    post.likedByCurrentUser
                      ? "bi bi-heart-fill"
                      : "bi bi-heart"
                  }
                ></i>

              </button>


              <button
                className="post-action-button"
                onClick={() =>
                  toggleComments(post.postId)
                }
              >

                <i
                  className={
                    openComments[post.postId]
                      ? "bi bi-chat-left-fill"
                      : "bi bi-chat-left"
                  }
                ></i>

              </button>


              <button className="post-action-button">

                <i className="bi bi-send"></i>

              </button>

            </div>


            {/* LIKES */}

            <div className="post-likes">

              <b>
                {post.likesCount} Likes
              </b>

            </div>


            {/* CAPTION */}

            <div className="post-caption">

              <b>
                {post.username}
              </b>

              <span>
                {post.caption}
              </span>

            </div>


            {/* COMMENTS COUNT */}

            <button
              className="post-comments-count"
              onClick={() =>
                toggleComments(post.postId)
              }
            >

              {post.commentsCount} Comments

            </button>


            {/* COMMENTS */}

            {openComments[post.postId] && (

              <div className="post-comments">

                <div className="comment-input-row">

                  <input
                    type="text"
                    className="comment-input"
                    placeholder="Add a comment..."
                    value={
                      commentText[post.postId] || ""
                    }
                    onChange={(e) =>
                      setCommentText(prev => ({
                        ...prev,
                        [post.postId]: e.target.value
                      }))
                    }
                    onKeyDown={(e) => {

                      if (e.key === "Enter") {
                        handleComment(post.postId)
                      }

                    }}
                  />

                  <button
                    className="comment-post-button"
                    onClick={() =>
                      handleComment(post.postId)
                    }
                  >
                    Post
                  </button>

                </div>


                {comments[post.postId]?.length > 0 ? (

                  <div className="comments-list">

                    {comments[post.postId].map((comment) => (

                      <div
                        key={comment.id}
                        className="comment-item"
                      >

                        <b>
                          {comment.username}
                        </b>

                        <span>
                          {comment.text}
                        </span>


                        {comment.userId === userId && (

                          <button
                            className="comment-delete-button"
                            onClick={() =>
                              handleDeleteComment(
                                comment.id,
                                post.postId
                              )
                            }
                          >
                            Delete
                          </button>

                        )}

                      </div>

                    ))}

                  </div>

                ) : (

                  <p className="no-comments">
                    No comments yet
                  </p>

                )}

              </div>

            )}

          </article>

        ))

      ) : (

        <div className="posts-loading">
          Loading Posts
        </div>

      )}

    </div>

  )

}

export default Posts