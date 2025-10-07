import type { Business, BusinessType } from "@/types/business";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Star, ShieldCheck, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

interface BusinessHeroProps {
  business: Business;
  onBack: () => void;
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
  veterinary: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  grooming:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  boarding: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  daycare:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  training:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "pet-shop": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
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

export const BusinessHero = ({ business, onBack }: BusinessHeroProps) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: business.businessName,
          text: business.description || "Check out this pet care business!",
          url: window.location.href,
        })
        .catch(() => {
          navigator.clipboard.writeText(window.location.href);
          toast.success("Link copied to clipboard!");
        });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const getTodaySchedule = () => {
    const today =
      dayNames[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    return business.businessHours?.[today];
  };

  const todaySchedule = getTodaySchedule();

  return (
    <>
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Businesses
      </Button>
      <Card className="gap-0 p-6 border-primary border-2">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex gap-6 flex-1">
            {/* Business Logo */}
            <div className="flex-shrink-0">
              {business.images?.logo ? (
                <img
                  src={business.images.logo}
                  alt={business.businessName}
                  className="w-24 h-24 rounded-lg object-cover border-2 border-border"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-border">
                  <span className="text-3xl font-bold text-primary">
                    {business.businessName.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Business Info */}
            <div className="space-y-4 flex-1">
              <div className="flex items-start gap-3">
                <div>
                  <h1 className="text-4xl font-bold mb-4">
                    {business.businessName}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={businessTypeColors[business.businessType]}>
                      {businessTypeLabels[business.businessType]}
                    </Badge>
                    {business.isVerified && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Verified Business
                      </Badge>
                    )}
                    {todaySchedule && (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {todaySchedule.isOpen
                          ? `Open • ${todaySchedule.open} - ${todaySchedule.close}`
                          : "Closed Today"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {business.ratings && business.ratings.totalReviews > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(business.ratings?.averageRating ?? 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">
                    {business.ratings.averageRating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({business.ratings.totalReviews} reviews)
                  </span>
                </div>
              )}

              {business.description && (
                <p className="text-muted-foreground max-w-2xl">
                  {business.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleShare} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};
