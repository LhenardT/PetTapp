import type { Business, BusinessType } from "@/types/business";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Star } from "lucide-react";

interface BusinessCardProps {
  business: Business;
  onClick?: () => void;
}

const businessTypeLabels: Record<BusinessType, string> = {
  veterinary: "Veterinary",
  grooming: "Grooming",
  boarding: "Boarding",
  daycare: "Daycare",
  training: "Training",
  "pet-shop": "Pet Shop",
  other: "Other",
};

const businessTypeColors: Record<BusinessType, string> = {
  veterinary: "bg-blue-100 text-blue-800",
  grooming: "bg-purple-100 text-purple-800",
  boarding: "bg-green-100 text-green-800",
  daycare: "bg-yellow-100 text-yellow-800",
  training: "bg-orange-100 text-orange-800",
  "pet-shop": "bg-pink-100 text-pink-800",
  other: "bg-gray-100 text-gray-800",
};

export const BusinessCard = ({ business, onClick }: BusinessCardProps) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden p-0 gap-0"
      onClick={onClick}
    >
      {/* Business Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5">
        {business.images?.logo ? (
          <img
            src={business.images.logo}
            alt={business.businessName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl font-bold text-primary/20">
              {business.businessName.charAt(0)}
            </span>
          </div>
        )}
        {business.isVerified && (
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 bg-primary text-white"
          >
            ✓ Verified
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Badge className={businessTypeColors[business.businessType]}>
            {businessTypeLabels[business.businessType]}
          </Badge>
          <CardTitle className="text-xl">{business.businessName}</CardTitle>
          {business.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {business.description}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>
              {business.address.street}, {business.address.city}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{business.contactInfo.phone}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{business.contactInfo.email}</span>
          </div>
        </div>

        {business.ratings && business.ratings.totalReviews > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">
              {business.ratings.averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              ({business.ratings.totalReviews} reviews)
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
