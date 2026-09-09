import React, { useEffect, useState } from "react"
import { apiFetch } from "./api"

function Profile() {

  const [profile, setProfile] = useState(null)
  const [following, setFollowing] = useState([])
  const [followers, setFollowers] = useState([])
  const [editMode, setEditMode] = useState(false)

  const userId = localStorage.getItem("userId")


  // ==========================================
  // LOAD PROFILE + FOLLOWERS + FOLLOWING
  // ==========================================

  useEffect(() => {

    const loadProfile = async () => {

      try {

        const profileResponse =
          await apiFetch(
            `/api/users/profile/${userId}`
          )

        if (!profileResponse.ok) {
          throw new Error("Failed to load profile")
        }

        const profileData =
          await profileResponse.json()

        setProfile(profileData)


        const followingResponse =
          await apiFetch(
            `/api/follows/following/${userId}`
          )

        if (!followingResponse.ok) {
          throw new Error("Failed to load following")
        }

        const followingData =
          await followingResponse.json()

        setFollowing(followingData)


        const followersResponse =
          await apiFetch(
            `/api/follows/followers/${userId}`
          )

        if (!followersResponse.ok) {
          throw new Error("Failed to load followers")
        }

        const followersData =
          await followersResponse.json()

        setFollowers(followersData)

      } catch (error) {

        console.log("Profile error:", error)

      }

    }

    loadProfile()

  }, [userId])


  // ==========================================
  // UNFOLLOW
  // ==========================================

  const handleUnfollow = async (followingId) => {

    try {

      const response =
        await apiFetch(
          `/api/follows?followerId=${userId}&followingId=${followingId}`,
          {
            method: "DELETE"
          }
        )

      if (!response.ok) {
        throw new Error("Unfollow failed")
      }

      setFollowing(prev =>
        prev.filter(
          follow =>
            follow.userId !== followingId
        )
      )

      setProfile(prev => ({
        ...prev,
        followingCount:
          prev.followingCount - 1
      }))

    } catch (error) {

      console.log("Unfollow error:", error)

    }

  }


  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const handleUpdate = async () => {

    try {

      const response =
        await apiFetch(
          `/api/users/profile/${userId}`,
          {
            method: "PUT",

            body: JSON.stringify({

              username:
                profile.username,

              profilePic:
                profile.profilePic,

              bio:
                profile.bio

            })

          }
        )

      if (!response.ok) {
        throw new Error("Profile update failed")
      }

      const updatedProfile =
        await response.json()

      setProfile(updatedProfile)

      setEditMode(false)

      alert(
        "Profile updated successfully 🔥"
      )

    } catch (error) {

      console.log(
        "Profile update error:",
        error
      )

    }

  }


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="profile-page">

      {profile ? (

        <div className="profile-container">

          {/* =====================================
              PROFILE HEADER
          ===================================== */}

          <div className="profile-header">

            <img
              src={profile.profilePic}
              className="profile-main-image rounded-circle"
              alt="profile"
            />


            <div className="profile-info">

              <h5 className="profile-username">
                {profile.username}
              </h5>


              <p className="profile-bio">
                {profile.bio}
              </p>


              <div className="profile-stats">

                <span>
                  <b>
                    {profile.postsCount}
                  </b>
                  {" "}posts
                </span>


                <span>
                  <b>
                    {profile.followersCount}
                  </b>
                  {" "}followers
                </span>


                <span>
                  <b>
                    {profile.followingCount}
                  </b>
                  {" "}following
                </span>

              </div>

            </div>

          </div>


          {/* =====================================
              EDIT BUTTON
          ===================================== */}

          <button
            className="btn btn-outline-secondary profile-edit-button"
            onClick={() =>
              setEditMode(true)
            }
          >
            Edit Profile
          </button>


          {/* =====================================
              EDIT PROFILE
          ===================================== */}

          {editMode && (

            <div className="profile-edit-box">

              <input
                type="text"
                className="form-control mb-2"
                placeholder="Username"
                value={
                  profile?.username || ""
                }
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    username:
                      e.target.value
                  })
                }
              />


              <input
                type="text"
                className="form-control mb-2"
                placeholder="Profile picture URL"
                value={
                  profile?.profilePic || ""
                }
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    profilePic:
                      e.target.value
                  })
                }
              />


              <textarea
                className="form-control mb-2"
                placeholder="Bio"
                value={
                  profile?.bio || ""
                }
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    bio:
                      e.target.value
                  })
                }
              />


              <div className="profile-edit-actions">

                <button
                  className="btn btn-primary"
                  onClick={handleUpdate}
                >
                  Save Changes
                </button>


                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setEditMode(false)
                  }
                >
                  Cancel
                </button>

              </div>

            </div>

          )}


          {/* =====================================
              FOLLOWERS
          ===================================== */}

          <div className="profile-section">

            <h5>
              Followers
            </h5>


            {followers.length > 0 ? (

              <div className="profile-user-list">

                {followers.map(
                  (follower) => (

                    <div
                      key={follower.id}
                      className="profile-user-row"
                    >

                      <img
                        src={
                          follower.profilePic
                        }
                        alt="profilepic"
                        className="dp rounded-circle"
                      />


                      <span>
                        {follower.username}
                      </span>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p>
                No followers
              </p>

            )}

          </div>


          {/* =====================================
              FOLLOWING
          ===================================== */}

          <div className="profile-section">

            <h5>
              Following
            </h5>


            {following.length > 0 ? (

              <div className="profile-user-list">

                {following.map(
                  (follow) => (

                    <div
                      key={follow.id}
                      className="profile-user-row"
                    >

                      <div className="profile-user-info">

                        <img
                          src={
                            follow.profilePic
                          }
                          alt="profilepic"
                          className="dp rounded-circle"
                        />


                        <span>
                          {follow.username}
                        </span>

                      </div>


                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          handleUnfollow(
                            follow.userId
                          )
                        }
                      >
                        Unfollow
                      </button>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p>
                Not following anyone
              </p>

            )}

          </div>

        </div>

      ) : (

        <p className="profile-loading">
          Loading profile...
        </p>

      )}

    </div>

  )

}

export default Profile