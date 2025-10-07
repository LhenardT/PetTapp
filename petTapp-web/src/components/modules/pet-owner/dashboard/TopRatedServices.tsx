import { useGetServices } from "@/lib/query/useService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Loader2, TrendingUp } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useNavigate } from "react-router-dom";
import type { Service } from "@/lib/api/services";

const categoryColors: Record<string, string> = {
  veterinary: "bg-red-100 text-red-700 border-red-200",
  grooming: "bg-pink-100 text-pink-700 border-pink-200",
  boarding: "bg-blue-100 text-blue-700 border-blue-200",
  daycare: "bg-yellow-100 text-yellow-700 border-yellow-200",
  training: "bg-green-100 text-green-700 border-green-200",
  emergency: "bg-orange-100 text-orange-700 border-orange-200",
  consultation: "bg-purple-100 text-purple-700 border-purple-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

const ServiceCard = ({ service }: { service: Service }) => {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 group border-2 hover:border-primary/50 h-full overflow-hidden gap-0 p-0"
      onClick={() => navigate(`/pet-owner/services/${service._id}`)}
    >
      {/* Service Image */}
      <div className="relative aspect-square bg-gradient-to-br from-primary/10 to-primary/5">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">🐾</span>
          </div>
        )}
        <Badge variant="outline" className={`${categoryColors[service.category]} absolute top-2 left-2 text-xs`}>
          {service.category}
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
              {service.name}
            </h3>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {service.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{service.duration} min</span>
              </div>
            </div>
            <div className="text-lg font-bold text-primary">
              {service.price.currency} {service.price.amount.toLocaleString()}
            </div>
          </div>

          {service.business && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground pt-2 border-t">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{service.business.name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const TopRatedServices = () => {
  const { data, isLoading } = useGetServices({ limit: 12 });
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Popular Services</h2>
        </div>
        <button
          onClick={() => navigate("/pet-owner/services")}
          className="text-sm font-medium text-primary hover:underline"
        >
          View All
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : data && data.data.length > 0 ? (
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {data.data.map((service) => (
              <CarouselItem key={service._id} className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <ServiceCard service={service} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ) : (
        <Card className="border-2">
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              No services available
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
