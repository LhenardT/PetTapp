import { Outlet } from "react-router-dom"

const BusinessOwnerLayout = () => {
  return (
    <div>
      <p>Business Owner Layout</p>
      <div className="p-4 container mx-auto">
        <Outlet />
      </div>
    </div>
  )
}

export default BusinessOwnerLayout
