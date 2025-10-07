import Appointments from "@/components/modules/pet-owner/Appointments";
import dashboardImage from "/image-1.png";
import CategoryCard from "@/components/modules/pet-owner/CategoryCard";
import { TopRatedServices } from "@/components/modules/pet-owner/dashboard/TopRatedServices";
import { NearbyBusinesses } from "@/components/modules/pet-owner/dashboard/NearbyBusinesses";
import {
  Stethoscope,
  Scissors,
  Hotel,
  Sun,
  GraduationCap,
  Siren,
  MessageSquare,
  Ellipsis,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    title: "Veterinary",
    icon: Stethoscope,
    value: "veterinary",
  },
  {
    title: "Grooming",
    icon: Scissors,
    value: "grooming",
  },
  {
    title: "Boarding",
    icon: Hotel,
    value: "boarding",
  },
  {
    title: "Daycare",
    icon: Sun,
    value: "daycare",
  },
  {
    title: "Training",
    icon: GraduationCap,
    value: "training",
  },
  {
    title: "Emergency",
    icon: Siren,
    value: "emergency",
  },
  {
    title: "Consultation",
    icon: MessageSquare,
    value: "consultation",
  },
  {
    title: "Other",
    icon: Ellipsis,
    value: "other",
  },
];

const PetOwnerDashboard = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate(`/pet-owner/services?category=${category}`);
  };

  return (
    <div className="space-y-10 md:space-y-14 lg:space-y-20">
      {/* Hero Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Pet care and wellness, one tap away
          </h1>
          <p className="text-lg text-muted-foreground">
            Find trusted veterinarians, groomers, and pet services near you
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl overflow-hidden border-2 shadow-lg">
            <img src={dashboardImage} alt="Happy pet" className="w-full h-full object-cover" />
          </div>
          <Appointments />
        </div>
      </div>

      {/* Service Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold">Browse by Category</h2>
        </div>
        <div className="flex flex-wrap gap-4 lg:gap-6 justify-center lg:justify-start">
          {categories.map((category) => (
            <div key={category.title} onClick={() => handleCategoryClick(category.value)}>
              <CategoryCard
                title={category.title}
                Icon={category.icon}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Top Rated Services */}
      <TopRatedServices />

      {/* Nearby Businesses */}
      <NearbyBusinesses />
    </div>
  );
};

export default PetOwnerDashboard;
