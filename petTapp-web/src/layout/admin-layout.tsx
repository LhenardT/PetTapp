import { Outlet } from "react-router-dom"

const AdminLayout = () => {
  return (
    <div>
      <p>Admin Layout</p>
      <div className="p-4 container mx-auto">
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout
