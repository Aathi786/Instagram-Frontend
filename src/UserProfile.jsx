import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { apiFetch } from "./api"

function UserProfile() {

  // Target user from URL
  // Example: /user/6a9ce0af8448488266ea119ec
  const { userId: targetUserId } = useParams()

  // Currently logged-in user
  const currentUserId = localStorage.getItem("userId")

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)


  // =========================
  // LOAD USER PROFILE
  // =========================

  const loadProfile = async () => {

    try {

      const response = await apiFetch(
        `/api/users/profile/${targetUserId}`
      )

      if (!response.ok) {
        throw new Error("Failed to load profile")
      }

      const data = await response.json()

     

      setProfile(data)

    } catch (error) {

      console.error("Profile error:", error)

    }
  }


  // =========================
  // LOAD USER POSTS
  // =========================

  const loadPosts = async () => {

    try {

      const response = await apiFetch("/api/posts")

      if (!response.ok) {
        throw new Error("Failed to load posts")
      }

      const data = await response.json()

      const userPosts = data.filter(
        post => post.userId === targetUserId
      )

   

      setPosts(userPosts)

    } catch (error) {

      console.error("Posts error:", error)

    }
  }


  // =========================
  // CHECK FOLLOWING STATUS
  // =========================

  const checkFollowing = async () => {

    try {

      const response = await apiFetch(
        `/api/follows/following/${currentUserId}`
      )

      if (!response.ok) {
        throw new Error("Failed to check following")
      }

      const data = await response.json()

      const alreadyFollowing = data.some(
        user => user.userId === targetUserId
      )

   

      setIsFollowing(alreadyFollowing)

    } catch (error) {

      console.error(
        "Following check error:",
        error
      )

    }
  }


  // =========================
  // LOAD EVERYTHING
  // =========================

  useEffect(() => {

    const loadData = async () => {

      setLoading(true)

      await Promise.all([
        loadProfile(),
        loadPosts()
      ])

      if (
        currentUserId &&
        currentUserId !== targetUserId
      ) {
        await checkFollowing()
      }

      setLoading(false)

    }

    loadData()

  }, [targetUserId])


  // =========================
  // FOLLOW USER
  // =========================

  const handleFollow = async () => {

    if (!targetUserId) {
      return
    }

    if (
      !currentUserId ||
      currentUserId === targetUserId
    ) {
      return
    }

    try {

      setFollowLoading(true)

      const response = await apiFetch(
        "/api/follows",
        {
          method: "POST",
          body: JSON.stringify({
            followerId: currentUserId,
            followingId: targetUserId
          })
        }
      )

      if (!response.ok) {
        throw new Error("Follow failed")
      }

      setIsFollowing(true)

      await loadProfile()

    } catch (error) {

      console.error(
        "Follow error:",
        error
      )

    } finally {

      setFollowLoading(false)

    }
  }


  // =========================
  // UNFOLLOW USER
  // =========================

  const handleUnfollow = async () => {

    if (!targetUserId || !currentUserId) {
      return
    }

    try {

      setFollowLoading(true)

      const response = await apiFetch(
        `/api/follows?followerId=${currentUserId}&followingId=${targetUserId}`,
        {
          method: "DELETE"
        }
      )

      if (!response.ok) {
        throw new Error("Unfollow failed")
      }

      setIsFollowing(false)

      await loadProfile()

    } catch (error) {

      console.error(
        "Unfollow error:",
        error
      )

    } finally {

      setFollowLoading(false)

    }
  }


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <div className="user-profile-page">

        <div className="user-profile-container">

          <h4 className="text-center">
            Loading profile...
          </h4>

        </div>

      </div>
    )
  }


  // =========================
  // PROFILE NOT FOUND
  // =========================

  if (!profile) {

    return (
      <div className="user-profile-page">

        <div className="user-profile-container">

          <h4 className="text-center">
            User not found
          </h4>

        </div>

      </div>
    )
  }


  // =========================
  // UI
  // =========================

  return (

    <div className="user-profile-page">

      <div className="user-profile-container">

        {/* PROFILE HEADER */}

        <div className="user-profile-header">

          {/* PROFILE IMAGE */}

          <div className="user-profile-image-wrapper">

            <img
              src={
                profile.profilePic ||
                "https://via.placeholder.com/150"
              }
              alt="profile"
              className="user-profile-image"
            />

          </div>


          {/* PROFILE DETAILS */}

          <div className="user-profile-details">

            <div className="user-profile-top">

              <h3 className="user-profile-username">
                {profile.username}
              </h3>


              {/* FOLLOW BUTTON */}

              {currentUserId !== targetUserId && (

                isFollowing ? (

                  <button
                    className="btn btn-outline-danger user-profile-follow-button"
                    onClick={handleUnfollow}
                    disabled={followLoading}
                  >
                    {followLoading
                      ? "Please wait..."
                      : "Unfollow"}
                  </button>

                ) : (

                  <button
                    className="btn btn-primary user-profile-follow-button"
                    onClick={handleFollow}
                    disabled={followLoading}
                  >
                    {followLoading
                      ? "Please wait..."
                      : "Follow"}
                  </button>

                )

              )}

            </div>


            {/* BIO */}

            <p className="user-profile-bio">
              {profile.bio || "No bio yet"}
            </p>


            {/* STATS */}

            <div className="user-profile-stats">

              <div>
                <strong>
                  {profile.postsCount || 0}
                </strong>
                {" "}posts
              </div>

              <div>
                <strong>
                  {profile.followersCount || 0}
                </strong>
                {" "}followers
              </div>

              <div>
                <strong>
                  {profile.followingCount || 0}
                </strong>
                {" "}following
              </div>

            </div>

          </div>

        </div>


        {/* POSTS */}

        <div className="user-profile-posts-section">

          <h4 className="user-profile-posts-title">
            Posts
          </h4>


          {posts.length === 0 ? (

            <p className="text-muted">
              No posts yet.
            </p>

          ) : (

            <div className="user-profile-post-grid">

              {posts.map(post => (

                <div
                  className="user-profile-post"
                  key={post.id}
                >

                  <img
                    src={post.imageUrl}
                    alt="post"
                    className="user-profile-post-image"
                  />

                  {post.caption && (

                    <p className="user-profile-post-caption">
                      {post.caption}
                    </p>

                  )}

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>

  )
}

export default UserProfile