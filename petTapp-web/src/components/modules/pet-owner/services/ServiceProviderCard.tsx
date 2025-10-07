import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin } from "lucide-react";
import type { Service } from "@/lib/api/services";

interface ServiceProviderCardProps {
  business: Service["business"];
}

const ServiceProviderCard = ({ business }: ServiceProviderCardProps) => {
  if (!business) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="size-5 text-primary" />
        <h2 className="text-xl font-semibold">Provider</h2>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="font-medium">{business.name}</h3>
        </div>

        {business.contactInfo?.address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 mt-0.5 flex-shrink-0" />
            <span>{business.contactInfo.address}</span>
          </div>
        )}

        {business.contactInfo?.phone && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Phone:</span>{" "}
            {business.contactInfo.phone}
          </div>
        )}
      </div>

      <Button variant="outline" className="w-full mt-4">
        View Provider Profile
      </Button>
    </Card>
  );
};

export default ServiceProviderCard;
