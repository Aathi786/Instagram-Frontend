const API_BASE_URL = "https://instagram-backend-weov.onrender.com"

export const apiFetch = async (url, options = {}) => {

  const token = localStorage.getItem("token")

  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `${API_BASE_URL}${url}`,
    {
      ...options,
      headers,
    }
  )

  // JWT expired / invalid
  if (response.status === 401) {

    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("username")

    window.location.href = "/login"

    throw new Error(
      "Session expired. Please login again."
    )
  }

  return response
}


export const logout = () => {

  localStorage.removeItem("token")
  localStorage.removeItem("userId")
  localStorage.removeItem("username")

  window.location.href = "/login"
}