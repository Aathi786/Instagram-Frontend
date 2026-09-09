import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from './api'

function Search() {

  const [username, setUsername] = useState("")
  const [users, setUsers] = useState([])
  const navigate = useNavigate()

  const handleSearch = async (e) => {

    const value = e.target.value

    setUsername(value)

    if (!value.trim()) {
      setUsers([])
      return
    }

    try {

      const response = await apiFetch(
        `/api/users/search?username=${encodeURIComponent(value)}`
      )

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()

    

      setUsers(data)

    } catch (error) {

      console.log("Search error:", error)

    }
  }


  return (

    <div className="search-page">

      <div className="search-container">

        <h3 className="search-title">
          Search
        </h3>


        <input
          type="text"
          className="form-control search-input"
          placeholder="Search username..."
          value={username}
          onChange={handleSearch}
        />


        <div className="search-results">

          {users.length > 0 ? (

            users.map(user => (

              <div
                key={user.id}
                className="search-user"
                onClick={() => navigate(`/user/${user.id}`)}
              >

                <img
                  src={
                    user.profilePic ||
                    "https://via.placeholder.com/50"
                  }
                  alt="profile"
                  className="search-profile-pic"
                />


                <div className="search-user-info">

                  <h6 className="search-username">
                    {user.username}
                  </h6>


                  <small className="search-bio">
                    {user.bio || ""}
                  </small>


                  <small className="search-id">
                    ID: {user.id}
                  </small>

                </div>

              </div>

            ))

          ) : username.trim() ? (

            <p className="search-no-results">
              No users found
            </p>

          ) : null}

        </div>

      </div>

    </div>

  )
}

export default Search