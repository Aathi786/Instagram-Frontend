import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { apiFetch } from "./api"

function ViewStory() {

  const navigate = useNavigate()

  const { id } = useParams()

  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

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

        


        // GROUP STORIES BY USER

        const groupedMap = new Map()

        data.forEach((story) => {

          if (!groupedMap.has(story.userId)) {

            groupedMap.set(story.userId, {

              userId: story.userId,
              username: story.username,
              profilePic: story.profilePic,
              stories: []

            })

          }

          groupedMap
            .get(story.userId)
            .stories
            .push(story)

        })


        const groupedStories =
          Array.from(
            groupedMap.values()
          )


        // SORT STORIES
        // OLDEST -> NEWEST

        groupedStories.forEach((group) => {

          group.stories.sort((a, b) => {

            return (
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()
            )

          })

        })


        // SORT USERS
        // NEWEST ACTIVE USER FIRST

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


        // CURRENT USER FIRST

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


        // FINAL ORDER

        const orderedStories = [

          ...(yourStoryGroup
            ? yourStoryGroup.stories
            : []),

          ...otherStoryGroups.flatMap(
            group => group.stories
          )

        ]


        setStories(orderedStories)

      } catch (error) {

        console.error(
          "View story error:",
          error
        )

      } finally {

        setLoading(false)

      }

    }

    loadStories()

  }, [currentUserId])


  const currentIndex = Number(id)


  // =========================
  // STORY PROGRESS
  // =========================

  useEffect(() => {

    if (
      loading ||
      stories.length === 0 ||
      Number.isNaN(currentIndex) ||
      currentIndex < 0 ||
      currentIndex >= stories.length
    ) {
      return
    }


    setProgress(0)

    const duration = 5000
    const intervalTime = 50

    let elapsed = 0


    const timer = setInterval(() => {

      elapsed += intervalTime

      const percentage =
        (elapsed / duration) * 100


      setProgress(
        percentage >= 100
          ? 100
          : percentage
      )


      if (elapsed >= duration) {

        clearInterval(timer)


        if (
          currentIndex <
          stories.length - 1
        ) {

          navigate(
            `/story/${
              currentIndex + 1
            }/${stories.length}`
          )

        } else {

          navigate("/")

        }

      }

    }, intervalTime)


    return () =>
      clearInterval(timer)

  }, [
    currentIndex,
    loading,
    stories.length,
    navigate
  ])


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (

      <div className="view-story-loading">

        <h4>
          Loading story...
        </h4>

      </div>

    )

  }


  // =========================
  // INVALID STORY
  // =========================

  if (
    stories.length === 0 ||
    Number.isNaN(currentIndex) ||
    currentIndex < 0 ||
    currentIndex >= stories.length
  ) {

    return (

      <div className="view-story-invalid">

        <div className="text-center">

          <h4>
            Story not found
          </h4>

          <button
            className="btn btn-primary mt-3"
            onClick={() =>
              navigate("/")
            }
          >
            Back to Home
          </button>

        </div>

      </div>

    )

  }


  const story =
    stories[currentIndex]


  // =========================
  // DELETE STORY
  // =========================

  const handleDelete = async () => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this story?"
      )

    if (!confirmDelete) {
      return
    }


    try {

      const response =
        await apiFetch(
          `/api/stories/${story.id}`,
          {
            method: "DELETE"
          }
        )


      if (!response.ok) {
        throw new Error(
          "Failed to delete story"
        )
      }


      alert(
        "Story deleted successfully"
      )

      navigate("/")

    } catch (error) {

      console.error(
        "Delete story error:",
        error
      )

      alert(
        "Failed to delete story"
      )

    }

  }


  // =========================
  // PREVIOUS
  // =========================

  const handlePrevious = () => {

    if (currentIndex > 0) {

      navigate(
        `/story/${
          currentIndex - 1
        }/${stories.length}`
      )

    }

  }


  // =========================
  // NEXT
  // =========================

  const handleNext = () => {

    if (
      currentIndex <
      stories.length - 1
    ) {

      navigate(
        `/story/${
          currentIndex + 1
        }/${stories.length}`
      )

    } else {

      navigate("/")

    }

  }


  // =========================
  // UI
  // =========================

  return (

    <div className="view-story-page">


      {/* =========================
          PROGRESS
      ========================= */}

      <div className="view-story-progress">

        <div
          className="view-story-progress-fill"
          style={{
            width: `${progress}%`
          }}
        />

      </div>


      {/* =========================
          USERNAME
      ========================= */}

      <div className="view-story-username">

        {story.username || "User"}

      </div>


      {/* =========================
          DELETE
      ========================= */}

      {story.userId === currentUserId && (

        <button
          onClick={handleDelete}
          title="Delete story"
          className="view-story-delete"
        >

          <i className="bi bi-trash"></i>

        </button>

      )}


      {/* =========================
          CLOSE
      ========================= */}

      <button
        onClick={() =>
          navigate("/")
        }
        className="view-story-close"
      >
        ✕
      </button>


      {/* =========================
          PREVIOUS
      ========================= */}

      <button
        className="view-story-prev"
        onClick={handlePrevious}
        disabled={currentIndex === 0}
      >

        <i className="bi bi-arrow-left-circle-fill"></i>

      </button>


      {/* =========================
          STORY IMAGE
      ========================= */}

      <div className="view-story-image-container">

        <img
          src={story.imageUrl}
          alt="story"
          className="view-story-image"
          onError={() => {

            console.log(
              "Story image failed:",
              story.imageUrl
            )

          }}
        />

      </div>


      {/* =========================
          NEXT
      ========================= */}

      <button
        className="view-story-next"
        onClick={handleNext}
      >

        <i className="bi bi-arrow-right-circle-fill"></i>

      </button>

    </div>

  )

}

export default ViewStory