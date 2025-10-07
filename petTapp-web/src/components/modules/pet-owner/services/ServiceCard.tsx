import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import type { Service } from "@/lib/api/services";

interface ServiceCardProps {
  service: Service;
}

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

const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <Link to={`/pet-owner/services/${service._id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full p-0 gap-0">
        {/* Service Image */}
        <div className="h-48 bg-muted">
          {service.imageUrl ? (
            <img
              src={service.imageUrl}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <span className="text-4xl">🐾</span>
            </div>
          )}
        </div>

        {/* Service Info */}
        <div className="p-4 space-y-3">
          <Badge className={`${getCategoryBadgeColor(service.category)}`}>
            {service.category.charAt(0).toUpperCase() +
              service.category.slice(1)}
          </Badge>
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {service.name}
            </h3>
            {service.business && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="size-3" />
                {service.business.name}
              </p>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {service.description}
          </p>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="size-4" />
              {service.duration} min
            </div>
            <div className="flex items-center gap-1 font-semibold text-primary">
              {service.price.amount.toLocaleString()} {service.price.currency}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ServiceCard;
