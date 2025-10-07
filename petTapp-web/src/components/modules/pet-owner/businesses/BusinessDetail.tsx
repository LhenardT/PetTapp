import type { Business, BusinessType } from "@/types/business";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Star,
  Award,
  ShieldCheck,
} from "lucide-react";

interface BusinessDetailProps {
  business: Business;
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

const dayNames = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const BusinessDetail = ({ business }: BusinessDetailProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-3xl font-bold">{business.businessName}</h1>
          {business.isVerified && (
            <Badge className="bg-green-100 text-green-800">
              <ShieldCheck className="w-4 h-4 mr-1" />
              Verified
            </Badge>
          )}
        </div>
        <Badge>{businessTypeLabels[business.businessType]}</Badge>
      </div>

      {/* Description */}
      {business.description && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{business.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-500" />
            <a
              href={`tel:${business.contactInfo.phone}`}
              className="text-blue-600 hover:underline"
            >
              {business.contactInfo.phone}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-500" />
            <a
              href={`mailto:${business.contactInfo.email}`}
              className="text-blue-600 hover:underline"
            >
              {business.contactInfo.email}
            </a>
          </div>
          {business.contactInfo.website && (
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-500" />
              <a
                href={business.contactInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {business.contactInfo.website}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <p>{business.address.street}</p>
              <p>
                {business.address.city}, {business.address.state}{" "}
                {business.address.zipCode}
              </p>
              <p>{business.address.country}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      {business.businessHours && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dayNames.map((day) => {
                const schedule = business.businessHours?.[day];
                return (
                  <div
                    key={day}
                    className="flex justify-between items-center py-1"
                  >
                    <span className="capitalize font-medium">{day}</span>
                    <span className="text-gray-600">
                      {schedule?.isOpen
                        ? `${schedule.open} - ${schedule.close}`
                        : "Closed"}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credentials */}
      {business.credentials && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {business.credentials.licenseNumber && (
              <div>
                <p className="font-medium">License Number</p>
                <p className="text-gray-600">{business.credentials.licenseNumber}</p>
              </div>
            )}
            {business.credentials.certifications &&
              business.credentials.certifications.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-2">
                    {business.credentials.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            {business.credentials.insuranceInfo && (
              <div>
                <p className="font-medium">Insurance</p>
                <p className="text-gray-600">{business.credentials.insuranceInfo}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ratings */}
      {business.ratings && business.ratings.totalReviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Ratings & Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold">
                  {business.ratings.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(business.ratings?.averageRating ?? 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-gray-600">
                <p>{business.ratings.totalReviews} reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
