// import AdvancedLoading from "@/components/AdvancedLoading"

import { Link } from "react-router-dom"
import { useEffect } from "react"
import { api } from "@/lib/api/config"

const LandingPage = () => {
  useEffect(() => {
    // Call health endpoint to wake up the server on Render free tier
    api.get("/health").catch(() => {
      // Silently fail - this is just to trigger cold start
    })
  }, [])

  return (
    <div>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
      {/* <AdvancedLoading /> */}
    </div>
  )
}

export default LandingPage
