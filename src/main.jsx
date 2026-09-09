
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import Login from './Login.jsx'
import CreateAccount from './CreateAccount.jsx'
import ViewStory from './ViewStory.jsx'
import Profile from './Profile.jsx'
import CreatePost from './CreatePost.jsx'
import Search from './Search.jsx'
import UserProfile from './UserProfile.jsx'
import PostDetails from './PostDetails.jsx'
import Messages from './Messages.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import CreateStory from './CreateStory.jsx'

import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'


const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
   { path: '/register', element: <CreateAccount /> },
  {
  path: '/story/create',
  element: (
    <ProtectedRoute>
      <CreateStory />
    </ProtectedRoute>
  )
},

  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    )
  },

  {
    path: '/messages',
    element: (
      <ProtectedRoute>
        <Messages />
      </ProtectedRoute>
    )
  },

  {
    path: '/post/:postId',
    element: (
      <ProtectedRoute>
        <PostDetails />
      </ProtectedRoute>
    )
  },

  {
    path: '/create',
    element: (
      <ProtectedRoute>
        <CreatePost />
      </ProtectedRoute>
    )
  },

  {
    path: '/user/:userId',
    element: (
      <ProtectedRoute>
        <UserProfile />
      </ProtectedRoute>
    )
  },

  {
    path: '/story/:id/:tot',
    element: (
      <ProtectedRoute>
        <ViewStory />
      </ProtectedRoute>
    )
  },

  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    )
  },

  {
    path: '/search',
    element: (
      <ProtectedRoute>
        <Search />
      </ProtectedRoute>
    )
  }
])


createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)

