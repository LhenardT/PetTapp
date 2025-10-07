import { Outlet } from "react-router-dom";
import Navbar from "@/components/modules/pet-owner/Navbar";

const PetOwnerLayout = () => {
  return (
    <div>
      <Navbar />
      <div className="p-4 container mx-auto mt-10">
        <Outlet />
      </div>
    </div>
  );
};

export default PetOwnerLayout;
