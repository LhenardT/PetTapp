import { useEffect } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { authMe } from "@/lib/api/auth"
import LoaderSpinner from "@/components/loader-spinner"

interface ProtectedRouteProps {
  allowedRoles?: Array<"pet-owner" | "business-owner" | "admin">
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, token, isAuthenticated, isLoading, setAuth, setLoading, logout } = useAuthStore()

  useEffect(() => {
    const verifyAuth = async () => {
      if (token && !user) {
        try {
          setLoading(true)
          const userData = await authMe()
          setAuth(userData, token)
        } catch (error) {
          console.error("Auth verification failed:", error)
          logout()
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    verifyAuth()
  }, [token, user, setAuth, setLoading, logout])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderSpinner width={8} height={8} />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's dashboard based on their role
    const redirectMap = {
      "pet-owner": "/pet-owner",
      "business-owner": "/business-owner",
      admin: "/admin",
    }
    return <Navigate to={redirectMap[user.role]} replace />
  }

  return <Outlet />
}
