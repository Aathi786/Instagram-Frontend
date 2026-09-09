
import React, { useEffect, useState } from 'react'
import { apiFetch } from './api'

function Suggestions() {

  const [profile, setProfile] = useState(null)
  const [suggestions, setSuggestions] = useState([])

const userId = localStorage.getItem("userId")


  // =========================
  // LOAD PROFILE & SUGGESTIONS
  // =========================

  useEffect(() => {

    const loadData = async () => {

      try {

        // Load current user's profile
        const profileResponse = await apiFetch(
          `/api/users/profile/${userId}`
        )

        if (!profileResponse.ok) {
          throw new Error("Failed to load profile")
        }

        const profileData =
          await profileResponse.json()

        setProfile(profileData)


        // Load suggestions
        const suggestionsResponse = await apiFetch(
          `/api/users/suggestions/${userId}`
        )

        if (!suggestionsResponse.ok) {
          throw new Error("Failed to load suggestions")
        }

        const suggestionsData =
          await suggestionsResponse.json()

        setSuggestions(suggestionsData)

      } catch (error) {

        console.log(
          "Suggestions error:",
          error
        )

      }

    }

    loadData()

  }, [])


  // =========================
  // FOLLOW USER
  // =========================

  const handleFollow = async (followingId) => {

    try {

      const response = await apiFetch(
        "/api/follows",
        {
          method: "POST",
          body: JSON.stringify({
            followerId: userId,
            followingId: followingId
          })
        }
      )

      if (!response.ok) {
        throw new Error("Follow failed")
      }


      // Follow செய்த user-ஐ
      // suggestions-லிருந்து remove பண்ணு

      setSuggestions(prev =>
        prev.filter(
          user => user.id !== followingId
        )
      )

    } catch (error) {

      console.log(
        "Follow error:",
        error
      )

    }
  }


  // =========================
  // UI
  // =========================

  return (

    <div>

      <div className="suggestions w-75 m-4">

        {/* CURRENT USER */}

        {profile ? (

          <div className="d-flex align-items-center">

            <img
              className="dp rounded-circle"
              src={profile.profilePic}
              alt="profilepic"
            />

            <h5 className="ms-2">
              {profile.username}
            </h5>

            <small className="ms-auto text-primary">
              switch
            </small>

          </div>

        ) : (

          <p>
            Loading profile...
          </p>

        )}


        {/* SUGGESTED FOR YOU */}

        <div className="d-flex mt-4">

          <p>
            Suggested for you
          </p>

          <b className="ms-auto">
            See All
          </b>

        </div>


        {/* SUGGESTIONS */}

        {suggestions.length > 0 ? (

          <div>

            {suggestions.map((suggestion) => (

              <div
                className="my-2"
                key={suggestion.id}
              >

                <div className="d-flex align-items-center">

                  <img
                    className="dp rounded-circle"
                    src={
                      suggestion.profilePic ||
                      "https://via.placeholder.com/50"
                    }
                    alt="profilepic"
                  />

                  <h5 className="ms-2">
                    {suggestion.username}
                  </h5>

                  <button
                    className="btn btn-link text-primary ms-auto"
                    onClick={() =>
                      handleFollow(suggestion.id)
                    }
                  >
                    Follow
                  </button>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div>
            No suggestions
          </div>

        )}

      </div>

    </div>

  )
}

export default Suggestions

