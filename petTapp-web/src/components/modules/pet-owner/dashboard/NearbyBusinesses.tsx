import { useGetBusinesses } from "@/lib/query/useBusiness";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Phone, Loader2, Navigation } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useNavigate } from "react-router-dom";
import type { Business } from "@/types/business";

const businessTypeColors: Record<string, string> = {
  veterinary: "bg-red-100 text-red-700 border-red-200",
  grooming: "bg-pink-100 text-pink-700 border-pink-200",
  boarding: "bg-blue-100 text-blue-700 border-blue-200",
  daycare: "bg-yellow-100 text-yellow-700 border-yellow-200",
  training: "bg-green-100 text-green-700 border-green-200",
  "pet-shop": "bg-purple-100 text-purple-700 border-purple-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

const BusinessCard = ({ business }: { business: Business }) => {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 group border-2 hover:border-primary/50 h-full overflow-hidden gap-0 p-0"
      onClick={() => navigate(`/pet-owner/businesses/${business._id}`)}
    >
      {/* Business Image */}
      <div className="relative aspect-square bg-gradient-to-br from-primary/10 to-primary/5">
        {business.images?.logo ? (
          <img
            src={business.images.logo}
            alt={business.businessName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-bold text-primary/20">
              {business.businessName.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute top-2 left-2 space-x-2">
          <Badge
            variant="outline"
            className={`${
              businessTypeColors[business.businessType]
            } text-xs capitalize`}
          >
            {business.businessType}
          </Badge>
          {business.isVerified && (
            <Badge
              variant="secondary"
              className="bg-primary text-white text-xs"
            >
              ✓ Verified
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                {business.businessName}
              </h3>
            </div>
          </div>

          {business.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {business.description}
            </p>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {business.address.city}, {business.address.state}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{business.contactInfo.phone}</span>
            </div>
          </div>

          {business.ratings && business.ratings.totalReviews > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">
                {business.ratings.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({business.ratings.totalReviews} reviews)
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const NearbyBusinesses = () => {
  const { data, isLoading } = useGetBusinesses({ limit: 12 });
  const navigate = useNavigate();

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Navigation className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Featured Businesses</h2>
        </div>
        <button
          onClick={() => navigate("/pet-owner/businesses")}
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
            {data.data.map((business) => (
              <CarouselItem
                key={business._id}
                className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              >
                <BusinessCard business={business} />
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
              No businesses available
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
