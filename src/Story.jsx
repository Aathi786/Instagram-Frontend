import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "./api"

function Story() {

  const navigate = useNavigate()

  const [stories, setStories] = useState([])

  const currentUserId =
    localStorage.getItem("userId")


  // =========================
  // LOAD STORIES
  // =========================

  useEffect(() => {

    const loadStories = async () => {

      try {

        const response =
          await apiFetch("/api/stories")

        if (!response.ok) {
          throw new Error("Failed to load stories")
        }

        const data =
          await response.json()

      

        setStories(data)

      } catch (error) {

        console.error(
          "Story error:",
          error
        )

      }

    }

    loadStories()

  }, [])


  // =========================
  // GROUP STORIES BY USER
  // =========================

  const groupedMap = new Map()

  stories.forEach((story) => {

    if (!groupedMap.has(story.userId)) {

      groupedMap.set(
        story.userId,
        {
          userId: story.userId,
          username: story.username,
          profilePic: story.profilePic,
          stories: []
        }
      )

    }

    groupedMap
      .get(story.userId)
      .stories
      .push(story)

  })


  const groupedStories =
    Array.from(groupedMap.values())


  // =========================
  // SORT USER STORIES
  // OLD → NEW
  // =========================

  groupedStories.forEach((group) => {

    group.stories.sort((a, b) => {

      return (
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
      )

    })

  })


  // =========================
  // SORT USERS
  // LATEST STORY FIRST
  // =========================

  groupedStories.sort((a, b) => {

    const aLatest =
      new Date(
        a.stories[
          a.stories.length - 1
        ].createdAt
      ).getTime()

    const bLatest =
      new Date(
        b.stories[
          b.stories.length - 1
        ].createdAt
      ).getTime()

    return bLatest - aLatest

  })


  // =========================
  // YOUR STORY FIRST
  // =========================

  const yourStoryGroup =
    groupedStories.find(
      group =>
        group.userId === currentUserId
    )


  const otherStoryGroups =
    groupedStories.filter(
      group =>
        group.userId !== currentUserId
    )


  // =========================
  // FINAL STORY ORDER
  // =========================

  const orderedStories = [

    ...(yourStoryGroup
      ? yourStoryGroup.stories
      : []),

    ...otherStoryGroups.flatMap(
      group => group.stories
    )

  ]


  // =========================
  // OPEN STORY
  // =========================

  const openStory = (story) => {

    const index =
      orderedStories.findIndex(
        item =>
          item.id === story.id
      )

    if (index !== -1) {

      navigate(
        `/story/${index}/${orderedStories.length}`
      )

    }

  }


  // =========================
  // YOUR STORY CLICK
  // =========================

  const handleYourStoryClick = () => {

    if (!yourStoryGroup) {

      navigate("/story/create")

      return

    }

    openStory(
      yourStoryGroup.stories[0]
    )

  }


  // =========================
  // ADD STORY
  // =========================

  const handleAddStory = (e) => {

    e.stopPropagation()

    navigate("/story/create")

  }


  return (

    <div className="stories-container">


      {/* =================================
          YOUR STORY
      ================================= */}

      <div
        className="story-item"
        onClick={handleYourStoryClick}
      >

        <div className="story-image-wrapper">

          <img
            src={
              yourStoryGroup?.profilePic ||
              "https://wallpaperaccess.com/full/44737.jpg"
            }
            alt="Your Story"
            className={
              yourStoryGroup
                ? "story-profile-image story-active"
                : "story-profile-image"
            }
          />


          {/* ADD BUTTON */}

          <button
            className="story-add-button"
            onClick={handleAddStory}
          >
            +
          </button>

        </div>


        <div className="story-username">

          Your Story

        </div>

      </div>


      {/* =================================
          OTHER USERS
      ================================= */}

      {otherStoryGroups.map(
        (group) => (

          <div
            key={group.userId}
            className="story-item"
            onClick={() =>
              openStory(
                group.stories[0]
              )
            }
          >

            <div className="story-image-wrapper">

              <img
                src={
                  group.profilePic ||
                  group.stories[0]?.imageUrl ||
                  ""
                }
                alt={
                  group.username ||
                  "story"
                }
                className="story-profile-image story-active"
              />

            </div>


            <div className="story-username">

              {group.username || "User"}

            </div>

          </div>

        )

      )}

    </div>

  )

}

export default Story