import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useGetServiceById } from "@/lib/query/useService";
import ServiceDetailsHero from "@/components/modules/pet-owner/services/ServiceDetailsHero";
import ServiceAvailability from "@/components/modules/pet-owner/services/ServiceAvailability";
import ServiceRequirements from "@/components/modules/pet-owner/services/ServiceRequirements";
import ServiceBookingCard from "@/components/modules/pet-owner/services/ServiceBookingCard";
import ServiceProviderCard from "@/components/modules/pet-owner/services/ServiceProviderCard";
import ServiceLocationCard from "@/components/modules/pet-owner/services/ServiceLocationCard";

const PetOwnerServiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: service, isLoading } = useGetServiceById(id!);

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      veterinary: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      grooming: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      boarding: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      daycare:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      training:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      emergency:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      consultation:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[category] || colors.other;
  };

  const formatDays = (days: string[]) => {
    return days
      .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
      .join(", ");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto">
        <Card className="p-12 text-center">
          <AlertCircle className="size-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Service not found</h2>
          <p className="text-muted-foreground mb-4">
            The service you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/pet-owner/services")}>
            Browse Services
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/pet-owner/services")}
        className="mb-6"
      >
        <ArrowLeft className="size-4 mr-2" />
        Back to Services
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <ServiceDetailsHero
            service={service}
            getCategoryBadgeColor={getCategoryBadgeColor}
          />
          <ServiceAvailability
            availability={service.availability}
            formatDays={formatDays}
          />
          <ServiceRequirements requirements={service.requirements} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ServiceBookingCard service={service} />
          <ServiceProviderCard business={service.business} />
          <ServiceLocationCard location={service.location} />
        </div>
      </div>
    </div>
  );
};

export default PetOwnerServiceDetails;
